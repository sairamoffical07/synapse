package com.synapse.backend.ai;

import com.synapse.backend.chroma.ChromaDBClient;
import com.synapse.backend.chroma.ChromaQueryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SemanticSearchService {

    private static final Logger log = LoggerFactory.getLogger(SemanticSearchService.class);

    private final EmbeddingService embeddingService;
    private final ChromaDBClient chromaDBClient;

    public SemanticSearchService(EmbeddingService embeddingService, ChromaDBClient chromaDBClient) {
        this.embeddingService = embeddingService;
        this.chromaDBClient = chromaDBClient;
    }

    public List<ChromaQueryResult> searchSimilarChunks(String query, int topK, Long userId) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        log.info("Generating embedding for search query: '{}'", query);
        List<Float> queryEmbedding = embeddingService.generateEmbedding(query);

        log.info("Executing ChromaDB similarity search for userId={}", userId);
        return chromaDBClient.querySimilarity(queryEmbedding, topK, userId);
    }
}
