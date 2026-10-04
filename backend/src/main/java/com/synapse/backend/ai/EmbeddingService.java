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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final String GEMINI_EMBEDDING_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String embeddingModel;

    public EmbeddingService(
            RestTemplate restTemplate,
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.embedding-model:text-embedding-004}") String embeddingModel) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.embeddingModel = embeddingModel;
    }

    private void validateApiKey() {
        if (apiKey.isEmpty()) {
            throw new AIServiceException(
                    "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable or property.");
        }
    }

    public List<Float> generateEmbedding(String text) {
        validateApiKey();

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text for embedding generation cannot be empty");
        }

        String url = GEMINI_EMBEDDING_API_URL + embeddingModel + ":embedContent?key=" + apiKey;

        Map<String, Object> part = Map.of("text", text);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of(
                "model", "models/" + embeddingModel,
                "content", content
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("embedding")) {
                Map<String, Object> embeddingObj = (Map<String, Object>) responseBody.get("embedding");
                List<Number> values = (List<Number>) embeddingObj.get("values");

                if (values != null) {
                    List<Float> floats = new ArrayList<>(values.size());
                    for (Number n : values) {
                        floats.add(n.floatValue());
                    }
                    return floats;
                }
            }

            throw new AIServiceException("Empty embedding response received from Gemini API");

        } catch (Exception ex) {
            log.error("Error calling Gemini Embedding API", ex);
            throw new AIServiceException("Failed to generate embedding: " + ex.getMessage(), ex);
        }
    }

    public List<List<Float>> generateEmbeddings(List<String> texts) {
        validateApiKey();

        if (texts == null || texts.isEmpty()) {
            return Collections.emptyList();
        }

        String url = GEMINI_EMBEDDING_API_URL + embeddingModel + ":batchEmbedContents?key=" + apiKey;

        List<Map<String, Object>> requests = new ArrayList<>(texts.size());
        for (String text : texts) {
            Map<String, Object> part = Map.of("text", text != null ? text : "");
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> req = Map.of(
                    "model", "models/" + embeddingModel,
                    "content", content
            );
            requests.add(req);
        }

        Map<String, Object> requestBody = Map.of("requests", requests);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("embeddings")) {
                List<Map<String, Object>> embeddingsList = (List<Map<String, Object>>) responseBody.get("embeddings");
                List<List<Float>> result = new ArrayList<>(embeddingsList.size());

                for (Map<String, Object> embObj : embeddingsList) {
                    List<Number> values = (List<Number>) embObj.get("values");
                    if (values != null) {
                        List<Float> floats = new ArrayList<>(values.size());
                        for (Number n : values) {
                            floats.add(n.floatValue());
                        }
                        result.add(floats);
                    } else {
                        result.add(Collections.emptyList());
                    }
                }

                return result;
            }

            throw new AIServiceException("Empty batch embedding response from Gemini API");

        } catch (Exception ex) {
            log.error("Error calling Gemini Batch Embedding API", ex);
            log.info("Falling back to sequential embedding generation...");
            List<List<Float>> result = new ArrayList<>(texts.size());
            for (String t : texts) {
                result.add(generateEmbedding(t));
            }
            return result;
        }
    }
}
