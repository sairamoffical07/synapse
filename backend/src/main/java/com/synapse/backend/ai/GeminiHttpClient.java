package com.synapse.backend.ai;

import com.synapse.backend.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GeminiHttpClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiHttpClient.class);

    // Longest single wait we accept inside a user request; longer provider hints are surfaced instead
    private static final long MAX_RETRY_WAIT_MS = 5_000L;
    private static final long BASE_BACKOFF_MS = 500L;
    // RetryInfo in Google error bodies, e.g. "retryDelay": "37s" or "1.5s"
    private static final Pattern RETRY_DELAY = Pattern.compile("\"retrydelay\"\\s*:\\s*\"(\\d+(?:\\.\\d+)?)s\"");

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final int maxRetries;

    public GeminiHttpClient(RestTemplate restTemplate,
                            @Value("${gemini.api-key:}") String apiKey,
                            @Value("${gemini.max-retries:2}") int maxRetries) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.maxRetries = Math.max(0, Math.min(maxRetries, 3));
    }

    public Map post(String url, Map<String, Object> requestBody) {
        if (apiKey.isEmpty()) {
            throw new AIServiceException("AI service is not configured. Add a valid GEMINI_API_KEY in the backend settings.", 503);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        for (int attempt = 0; ; attempt++) {
            try {
                return restTemplate.postForObject(url, entity, Map.class);
            } catch (RestClientResponseException ex) {
                int status = ex.getStatusCode().value();
                // Only inspected for classification; never logged or returned
                String providerBody = ex.getResponseBodyAsString().toLowerCase();
                Category category = classify(status, providerBody);
                Long hintedDelay = hintedDelayMs(ex, providerBody);

                if (category.retryable && attempt < maxRetries
                        && (hintedDelay == null || hintedDelay <= MAX_RETRY_WAIT_MS)) {
                    long delay = hintedDelay != null ? hintedDelay : backoffMs(attempt);
                    log.info("Gemini transient failure, retrying: category={}, status={}, attempt={}, delayMs={}",
                            category.code, status, attempt + 1, delay);
                    pause(delay);
                    continue;
                }
                log.warn("Gemini request failed: category={}, status={}, attempts={}", category.code, status, attempt + 1);
                throw new AIServiceException(message(category, hintedDelay), category.clientStatus, ex);
            } catch (ResourceAccessException ex) {
                log.warn("Gemini request failed: category=timeout_or_network_error");
                throw new AIServiceException("The AI service did not respond in time. Please try again.", 504, ex);
            } catch (RuntimeException ex) {
                log.warn("Gemini request failed: category=unexpected_client_error");
                throw new AIServiceException("The AI service could not complete this request. Please try again.", 502, ex);
            }
        }
    }

    enum Category {
        INVALID_KEY("invalid_key", false, 503),
        PERMISSION_DENIED("permission_denied", false, 503),
        PAYMENT_REQUIRED("payment_required", false, 503),
        PRECONDITION_FAILED("failed_precondition", false, 503),
        MODEL_UNAVAILABLE("model_unavailable", false, 503),
        QUOTA_EXHAUSTED("quota_exhausted", false, 429),
        RATE_LIMITED("rate_limited", true, 429),
        OVERLOADED("provider_overloaded", true, 503),
        PROVIDER_ERROR("provider_internal_error", true, 502),
        TIMEOUT("provider_timeout", false, 504),
        BAD_REQUEST("bad_request", false, 502),
        OTHER("provider_error", false, 502);

        final String code;
        final boolean retryable;
        final int clientStatus;

        Category(String code, boolean retryable, int clientStatus) {
            this.code = code;
            this.retryable = retryable;
            this.clientStatus = clientStatus;
        }
    }

    static Category classify(int status, String body) {
        boolean keyProblem = body.contains("api_key_invalid") || body.contains("api key not valid")
                || body.contains("api key expired") || body.contains("api_key_expired");
        return switch (status) {
            case 400 -> {
                if (keyProblem) yield Category.INVALID_KEY;
                if (body.contains("failed_precondition") || body.contains("location is not supported")
                        || body.contains("free tier is not available")) yield Category.PRECONDITION_FAILED;
                yield Category.BAD_REQUEST;
            }
            case 401 -> Category.INVALID_KEY;
            case 402 -> Category.PAYMENT_REQUIRED;
            case 403 -> keyProblem || body.contains("leaked") ? Category.INVALID_KEY : Category.PERMISSION_DENIED;
            case 404 -> Category.MODEL_UNAVAILABLE;
            case 429 -> isQuotaExhausted(body) ? Category.QUOTA_EXHAUSTED : Category.RATE_LIMITED;
            case 500 -> Category.PROVIDER_ERROR;
            case 503 -> Category.OVERLOADED;
            case 504 -> Category.TIMEOUT;
            default -> Category.OTHER;
        };
    }

    // Per-minute limits also say "exceeded your current quota", so look for daily/billing markers specifically
    private static boolean isQuotaExhausted(String body) {
        return body.contains("quota_exceeded") || body.contains("perday") || body.contains("per_day")
                || body.contains("per day") || body.contains("daily") || body.contains("billing")
                || body.contains("prepay") || body.contains("limit: 0");
    }

    private Long hintedDelayMs(RestClientResponseException ex, String body) {
        String retryAfter = ex.getResponseHeaders() == null ? null : ex.getResponseHeaders().getFirst(HttpHeaders.RETRY_AFTER);
        if (retryAfter != null) {
            try {
                return Math.max(0L, Long.parseLong(retryAfter.trim()) * 1000L);
            } catch (NumberFormatException ignored) {
                try {
                    return Math.max(0L, ZonedDateTime.parse(retryAfter.trim(), DateTimeFormatter.RFC_1123_DATE_TIME)
                            .toInstant().toEpochMilli() - System.currentTimeMillis());
                } catch (RuntimeException ignoredDate) { /* fall through to the body hint */ }
            }
        }
        Matcher m = RETRY_DELAY.matcher(body);
        if (m.find()) {
            return (long) (Double.parseDouble(m.group(1)) * 1000);
        }
        return null;
    }

    // Exponential backoff with jitter: 50–100% of 500ms, 1s, 2s...
    private static long backoffMs(int attempt) {
        long ceiling = BASE_BACKOFF_MS << attempt;
        return ceiling / 2 + ThreadLocalRandom.current().nextLong(ceiling / 2 + 1);
    }

    private void pause(long millis) {
        try { Thread.sleep(millis); }
        catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw new AIServiceException("The AI request was interrupted. Please try again.", 503, ex); }
    }

    private static String message(Category category, Long hintedDelay) {
        return switch (category) {
            case INVALID_KEY -> "The AI service key is invalid or has been revoked. The site owner needs to update GEMINI_API_KEY.";
            case PERMISSION_DENIED -> "The AI service key does not have permission for this model or project. The site owner needs to check the Gemini API key settings.";
            case PAYMENT_REQUIRED -> "The AI service account has no remaining credit. The site owner needs to check the Gemini account.";
            case PRECONDITION_FAILED -> "The AI service is not available for this API key's project or region. The site owner needs to check the Gemini account.";
            case MODEL_UNAVAILABLE -> "The configured AI model is not available to this API key. The site owner needs to check GEMINI_MODEL and GEMINI_EMBEDDING_MODEL.";
            case QUOTA_EXHAUSTED -> "The AI service's free daily quota is used up. Please try again after it resets (midnight Pacific time).";
            case RATE_LIMITED -> hintedDelay != null && hintedDelay > 0
                    ? "The AI service is receiving too many requests. Please wait about " + Math.max(1, Math.round(hintedDelay / 1000.0)) + " seconds and try again."
                    : "The AI service is receiving too many requests. Please wait a moment and try again.";
            case OVERLOADED -> "The AI model is temporarily overloaded. Please try again in a minute.";
            case TIMEOUT -> "The AI service took too long to respond. Please try again.";
            default -> "The AI service could not complete this request. Please try again later.";
        };
    }
}
