package com.synapse.backend.ai;

import com.synapse.backend.exception.AIServiceException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.ExpectedCount.times;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GeminiHttpClientTest {

    private static final String URL = "https://generativelanguage.googleapis.com/v1beta/models/m:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
    private final GeminiHttpClient client = new GeminiHttpClient(restTemplate, "test-key", 2);

    private AIServiceException failWith(HttpStatus status, String body, int expectedCalls) {
        server.expect(times(expectedCalls), requestTo(URL))
                .andRespond(withStatus(status).contentType(MediaType.APPLICATION_JSON).body(body));
        AIServiceException ex = assertThrows(AIServiceException.class, () -> client.post(URL, Map.of()));
        server.verify();
        assertFalse(ex.getMessage().contains("test-key"));
        return ex;
    }

    @Test
    void invalidKeyIsNotRetried() {
        AIServiceException ex = failWith(HttpStatus.BAD_REQUEST,
                "{\"error\":{\"code\":400,\"message\":\"API key not valid. Please pass a valid API key.\",\"status\":\"INVALID_ARGUMENT\",\"details\":[{\"reason\":\"API_KEY_INVALID\"}]}}", 1);
        assertEquals(503, ex.getStatus());
        assertTrue(ex.getMessage().contains("GEMINI_API_KEY"));
    }

    @Test
    void retiredModelIsReportedAsModelProblem() {
        AIServiceException ex = failWith(HttpStatus.NOT_FOUND,
                "{\"error\":{\"code\":404,\"message\":\"models/gemini-1.5-flash is not found for API version v1beta\",\"status\":\"NOT_FOUND\"}}", 1);
        assertTrue(ex.getMessage().contains("GEMINI_MODEL"));
    }

    @Test
    void dailyQuotaIsNotRetried() {
        AIServiceException ex = failWith(HttpStatus.TOO_MANY_REQUESTS,
                "{\"error\":{\"code\":429,\"message\":\"You exceeded your current quota.\",\"status\":\"RESOURCE_EXHAUSTED\",\"details\":[{\"violations\":[{\"quotaId\":\"GenerateRequestsPerDayPerProjectPerModel-FreeTier\"}]}]}}", 1);
        assertEquals(429, ex.getStatus());
        assertTrue(ex.getMessage().contains("daily quota"));
    }

    @Test
    void perMinuteLimitWithLongRetryDelayIsSurfacedWithoutWaiting() {
        AIServiceException ex = failWith(HttpStatus.TOO_MANY_REQUESTS,
                "{\"error\":{\"code\":429,\"message\":\"You exceeded your current quota.\",\"status\":\"RESOURCE_EXHAUSTED\",\"details\":[{\"violations\":[{\"quotaId\":\"GenerateRequestsPerMinutePerProjectPerModel-FreeTier\"}]},{\"@type\":\"type.googleapis.com/google.rpc.RetryInfo\",\"retryDelay\":\"37s\"}]}}", 1);
        assertEquals(429, ex.getStatus());
        assertTrue(ex.getMessage().contains("37 seconds"));
    }

    @Test
    void perMinuteLimitWithShortRetryDelayIsRetried() {
        server.expect(once(), requestTo(URL)).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":{\"code\":429,\"status\":\"RESOURCE_EXHAUSTED\",\"details\":[{\"retryDelay\":\"0.2s\"}]}}"));
        server.expect(once(), requestTo(URL)).andRespond(withSuccess("{\"ok\":true}", MediaType.APPLICATION_JSON));
        assertEquals(true, client.post(URL, Map.of()).get("ok"));
        server.verify();
    }

    @Test
    void overloadIsRetriedThenSucceeds() {
        server.expect(once(), requestTo(URL)).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":{\"code\":503,\"message\":\"The model is overloaded.\",\"status\":\"UNAVAILABLE\"}}"));
        server.expect(once(), requestTo(URL)).andRespond(withSuccess("{\"ok\":true}", MediaType.APPLICATION_JSON));
        assertEquals(true, client.post(URL, Map.of()).get("ok"));
        server.verify();
    }

    @Test
    void persistentOverloadStopsAfterBoundedRetries() {
        AIServiceException ex = failWith(HttpStatus.SERVICE_UNAVAILABLE,
                "{\"error\":{\"code\":503,\"message\":\"high demand\",\"status\":\"UNAVAILABLE\"}}", 3);
        assertEquals(503, ex.getStatus());
        assertTrue(ex.getMessage().contains("overloaded"));
    }

    @Test
    void retryAfterHeaderAboveBudgetIsNotWaitedOn() {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.RETRY_AFTER, "120");
        server.expect(once(), requestTo(URL)).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE).headers(headers));
        assertThrows(AIServiceException.class, () -> client.post(URL, Map.of()));
        server.verify();
    }

    @Test
    void missingKeyFailsFastWithoutCallingProvider() {
        GeminiHttpClient unconfigured = new GeminiHttpClient(restTemplate, " ", 2);
        AIServiceException ex = assertThrows(AIServiceException.class, () -> unconfigured.post(URL, Map.of()));
        assertEquals(503, ex.getStatus());
        server.verify();
    }
}
