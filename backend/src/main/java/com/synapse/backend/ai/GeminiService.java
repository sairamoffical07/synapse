package com.synapse.backend.ai;

import com.synapse.backend.exception.AIServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final GeminiHttpClient geminiHttpClient;
    private final String model;

    public GeminiService(
            GeminiHttpClient geminiHttpClient,
            @Value("${gemini.model:gemini-3.1-flash-lite}") String model) {
        this.geminiHttpClient = geminiHttpClient;
        this.model = model;
    }

    public String generateText(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt cannot be empty");
        }

        String url = GEMINI_API_URL + model + ":generateContent";

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        try {
            Map responseBody = geminiHttpClient.post(url, requestBody);

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

            throw new AIServiceException("The AI service returned an empty response. Please try again.", 502);

        } catch (AIServiceException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            throw new AIServiceException("The AI service returned an unreadable response. Please try again.", 502, ex);
        }
    }
}
