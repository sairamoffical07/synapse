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

@Component
public class GeminiHttpClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiHttpClient.class);
    private static final int MAX_RETRIES = 2;
    private final RestTemplate restTemplate;
    private final String apiKey;

    public GeminiHttpClient(RestTemplate restTemplate, @Value("${gemini.api-key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
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
                String providerBody = ex.getResponseBodyAsString().toLowerCase();
                boolean exhaustedQuota = providerBody.contains("quota") || providerBody.contains("billing")
                        || providerBody.contains("daily limit");
                boolean retryable = (status == 503 || (status == 429 && !exhaustedQuota)) && attempt < MAX_RETRIES;
                if (retryable) {
                    pause(retryDelay(ex, attempt));
                    continue;
                }
                log.warn("Gemini request failed: category={}, status={}", category(status, providerBody), status);
                throw new AIServiceException(safeMessage(status, providerBody), safeStatus(status, providerBody), ex);
            } catch (ResourceAccessException ex) {
                log.warn("Gemini request failed: category=timeout_or_network_error");
                throw new AIServiceException("The AI service did not respond in time. Please try again.", 504, ex);
            } catch (RuntimeException ex) {
                log.warn("Gemini request failed: category=unexpected_client_error");
                throw new AIServiceException("The AI service could not complete this request. Please try again.", 502, ex);
            }
        }
    }

    private long retryDelay(RestClientResponseException ex, int attempt) {
        String retryAfter = ex.getResponseHeaders() == null ? null : ex.getResponseHeaders().getFirst(HttpHeaders.RETRY_AFTER);
        if (retryAfter != null) {
            try { return Math.min(4000L, Math.max(0L, Long.parseLong(retryAfter.trim()) * 1000L)); }
            catch (NumberFormatException ignored) {
                try { return Math.min(4000L, Math.max(0L, ZonedDateTime.parse(retryAfter, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant().toEpochMilli() - System.currentTimeMillis())); }
                catch (RuntimeException ignoredDate) { /* use bounded exponential delay */ }
            }
        }
        return (long) (500L * (1 << attempt) + ThreadLocalRandom.current().nextLong(100, 301));
    }

    private void pause(long millis) {
        try { Thread.sleep(millis); }
        catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw new AIServiceException("The AI request was interrupted. Please try again.", 503, ex); }
    }

    private int safeStatus(int status, String body) {
        if (status == 401 || status == 403) return 503;
        if (status == 404) return 503;
        if (status == 429 && (body.contains("quota") || body.contains("billing") || body.contains("daily limit"))) return 429;
        return 502;
    }

    private String category(int status, String body) {
        if (status == 401 || status == 403) return "invalid_key_or_permission";
        if (status == 404) return "model_unavailable_or_not_supported";
        if (status == 429 && (body.contains("quota") || body.contains("billing") || body.contains("daily limit"))) return "quota_exhausted";
        if (status == 429) return "rate_limited";
        if (status == 503) return "provider_overloaded";
        return "provider_error";
    }

    private String safeMessage(int status, String body) {
        return switch (category(status, body)) {
            case "invalid_key_or_permission" -> "The AI service key is invalid or does not have permission. Check GEMINI_API_KEY and its API access settings.";
            case "model_unavailable_or_not_supported" -> "The configured AI model is unavailable to this API key. Check GEMINI_MODEL or GEMINI_EMBEDDING_MODEL.";
            case "quota_exhausted" -> "The AI service free-tier quota is exhausted. Try again after the quota resets.";
            case "rate_limited" -> "The AI service is rate-limiting requests. Please wait a moment and try again.";
            case "provider_overloaded" -> "The AI service is temporarily overloaded. Please try again shortly.";
            default -> "The AI service could not complete this request. Please try again later.";
        };
    }
}
