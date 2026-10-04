package com.synapse.backend.ai;

import com.synapse.backend.chroma.ChromaDBClient;
import com.synapse.backend.chroma.ChromaDocumentMetadata;
import com.synapse.backend.chroma.ChromaQueryResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SemanticSearchService {

    private static final Logger log = LoggerFactory.getLogger(SemanticSearchService.class);

    private final EmbeddingService embeddingService;
    private final ChromaDBClient chromaDBClient;
    private final DocumentChunkRepository documentChunkRepository;

    public SemanticSearchService(
            EmbeddingService embeddingService,
            ChromaDBClient chromaDBClient,
            DocumentChunkRepository documentChunkRepository) {
        this.embeddingService = embeddingService;
        this.chromaDBClient = chromaDBClient;
        this.documentChunkRepository = documentChunkRepository;
    }

    public List<ChromaQueryResult> searchSimilarChunks(String query, int topK, Long userId) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        log.info("Generating embedding for search query: '{}'", query);
        List<Float> queryEmbedding = embeddingService.generateEmbedding(query);

        log.info("Executing ChromaDB similarity search for userId={}", userId);
        List<ChromaQueryResult> results = chromaDBClient.querySimilarity(queryEmbedding, topK, userId);

        if (results != null && !results.isEmpty()) {
            return results;
        }

        log.info("Vector store returned empty results. Fetching document chunks from database for userId={}", userId);
        List<DocumentChunk> dbChunks = documentChunkRepository.findByStudyMaterialUserId(userId);
        if (dbChunks == null || dbChunks.isEmpty()) {
            return List.of();
        }

        List<ChromaQueryResult> fallbackResults = new ArrayList<>();
        int count = Math.min(topK, dbChunks.size());
        for (int i = 0; i < count; i++) {
            DocumentChunk chunk = dbChunks.get(i);
            ChromaDocumentMetadata meta = ChromaDocumentMetadata.builder()
                    .studyMaterialId(chunk.getStudyMaterial() != null ? chunk.getStudyMaterial().getId() : null)
                    .fileName(chunk.getStudyMaterial() != null ? chunk.getStudyMaterial().getOriginalFileName() : "Study Material")
                    .chunkIndex(chunk.getChunkIndex())
                    .userId(userId)
                    .build();

            fallbackResults.add(ChromaQueryResult.builder()
                    .id("chunk-" + chunk.getId())
                    .documentText(chunk.getChunkText())
                    .metadata(meta)
                    .distance(0.1)
                    .build());
        }

        return fallbackResults;
    }
}
