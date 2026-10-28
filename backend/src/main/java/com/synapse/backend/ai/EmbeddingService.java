package com.synapse.backend.ai;

import com.synapse.backend.exception.AIServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {
    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final int OUTPUT_DIMENSIONALITY = 768;
    // batchEmbedContents accepts at most 100 requests per call
    private static final int MAX_BATCH_SIZE = 100;
    private final GeminiHttpClient geminiHttpClient;
    private final String embeddingModel;

    public EmbeddingService(GeminiHttpClient geminiHttpClient,
                            @Value("${gemini.embedding-model:gemini-embedding-2}") String embeddingModel) {
        this.geminiHttpClient = geminiHttpClient;
        this.embeddingModel = embeddingModel;
    }

    public List<Float> generateEmbedding(String text) {
        if (text == null || text.isBlank()) throw new IllegalArgumentException("Text for embedding generation cannot be empty");
        Map<String, Object> request = Map.of(
                "model", "models/" + embeddingModel,
                "content", Map.of("parts", List.of(Map.of("text", text))),
                "output_dimensionality", OUTPUT_DIMENSIONALITY
        );
        Map response = geminiHttpClient.post(API_URL + embeddingModel + ":embedContent", request);
        Object embedding = response == null ? null : response.get("embedding");
        if (embedding instanceof Map<?, ?> obj) return toFloats(obj.get("values"));
        throw new AIServiceException("The AI service returned an invalid embedding response. Please try again.", 502);
    }

    public List<List<Float>> generateEmbeddings(List<String> texts) {
        if (texts == null || texts.isEmpty()) return Collections.emptyList();
        List<List<Float>> result = new ArrayList<>(texts.size());
        for (int start = 0; start < texts.size(); start += MAX_BATCH_SIZE) {
            result.addAll(embedBatch(texts.subList(start, Math.min(start + MAX_BATCH_SIZE, texts.size()))));
        }
        return result;
    }

    private List<List<Float>> embedBatch(List<String> texts) {
        List<Map<String, Object>> requests = new ArrayList<>(texts.size());
        for (String text : texts) {
            requests.add(Map.of(
                    "model", "models/" + embeddingModel,
                    "content", Map.of("parts", List.of(Map.of("text", text == null ? "" : text))),
                    "output_dimensionality", OUTPUT_DIMENSIONALITY
            ));
        }
        Map response = geminiHttpClient.post(API_URL + embeddingModel + ":batchEmbedContents", Map.of("requests", requests));
        Object embeddings = response == null ? null : response.get("embeddings");
        if (!(embeddings instanceof List<?> list) || list.size() != texts.size()) {
            throw new AIServiceException("The AI service returned an incomplete embedding response. Please try again.", 502);
        }
        List<List<Float>> result = new ArrayList<>(list.size());
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> obj)) throw new AIServiceException("The AI service returned an invalid embedding response. Please try again.", 502);
            result.add(toFloats(obj.get("values")));
        }
        return result;
    }

    private List<Float> toFloats(Object raw) {
        if (!(raw instanceof List<?> values) || values.size() != OUTPUT_DIMENSIONALITY) {
            throw new AIServiceException("The AI embedding size did not match the document index. Please contact support.", 502);
        }
        List<Float> floats = new ArrayList<>(values.size());
        for (Object value : values) {
            if (!(value instanceof Number number)) throw new AIServiceException("The AI service returned an invalid embedding. Please try again.", 502);
            floats.add(number.floatValue());
        }
        return floats;
    }
}
