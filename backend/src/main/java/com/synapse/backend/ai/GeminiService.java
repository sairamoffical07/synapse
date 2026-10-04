package com.synapse.backend.ai;

import com.synapse.backend.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String model;

    public GeminiService(
            RestTemplate restTemplate,
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model;
    }

    public String generateText(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt cannot be empty");
        }

        if (apiKey.isEmpty()) {
            log.error("Gemini API key is unconfigured. Set the GEMINI_API_KEY environment variable.");
            throw new AIServiceException("Gemini API key is not configured on the server. Please set GEMINI_API_KEY.");
        }

        String url = GEMINI_API_URL + model + ":generateContent?key=" + apiKey;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> candidateContent = (Map<String, Object>) firstCandidate.get("content");
                    if (candidateContent != null && candidateContent.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            String text = (String) parts.get(0).get("text");
                            if (text != null && !text.isBlank()) {
                                return text.trim();
                            }
                        }
                    }
                }
            }

            throw new AIServiceException("Gemini API returned an empty or invalid response candidate.");

        } catch (AIServiceException aie) {
            throw aie;
        } catch (Exception ex) {
            log.error("Error calling Gemini GenerateContent API", ex);
            throw new AIServiceException("Failed to generate text from Gemini AI: " + ex.getMessage(), ex);
        }
    }
}
