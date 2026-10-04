package com.synapse.backend.ai;

import com.synapse.backend.chroma.ChromaDocumentMetadata;
import com.synapse.backend.chroma.ChromaQueryResult;
import com.synapse.backend.dto.ChatResponse;
import com.synapse.backend.dto.ChatSourceDTO;
import com.synapse.backend.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);
    private static final int TOP_K_RESULTS = 5;

    private final SemanticSearchService semanticSearchService;
    private final GeminiService geminiService;

    public RagService(SemanticSearchService semanticSearchService, GeminiService geminiService) {
        this.semanticSearchService = semanticSearchService;
        this.geminiService = geminiService;
    }

    public ChatResponse answerQuestion(String question, User user) {
        log.info("Executing RAG question answering for user [userId={}, question='{}']", user.getId(), question);

        List<ChromaQueryResult> relevantChunks =
                semanticSearchService.searchSimilarChunks(question, TOP_K_RESULTS, user.getId());

        if (relevantChunks.isEmpty()) {
            return ChatResponse.builder()
                    .answer("I could not find any relevant information in your uploaded study materials to answer this question. Please upload relevant documents first.")
                    .sources(List.of())
                    .build();
        }

        StringBuilder contextBuilder = new StringBuilder();
        List<ChatSourceDTO> sources = new ArrayList<>();
        Set<String> seenSources = new HashSet<>();

        for (int i = 0; i < relevantChunks.size(); i++) {
            ChromaQueryResult chunk = relevantChunks.get(i);
            ChromaDocumentMetadata meta = chunk.getMetadata();

            contextBuilder.append(String.format("--- Context Excerpt [%d] (Source: %s, Chunk: %s) ---\n",
                    i + 1,
                    meta != null && meta.getFileName() != null ? meta.getFileName() : "Unknown Document",
                    meta != null && meta.getChunkIndex() != null ? meta.getChunkIndex() : "?"));
            contextBuilder.append(chunk.getDocumentText()).append("\n\n");

            if (meta != null) {
                String sourceKey = meta.getStudyMaterialId() + ":" + meta.getChunkIndex();
                if (!seenSources.contains(sourceKey)) {
                    seenSources.add(sourceKey);
                    sources.add(ChatSourceDTO.builder()
                            .studyMaterialId(meta.getStudyMaterialId())
                            .fileName(meta.getFileName())
                            .chunkIndex(meta.getChunkIndex())
                            .build());
                }
            }
        }

        String prompt = String.format("""
                You are Synapse, an AI Academic Tutor assisting a student with their course study materials.
                Answer the student's question accurately, clearly, and concisely based ONLY on the provided context excerpts from their study materials.
                If the provided context does not contain sufficient information to answer the question, state clearly that the answer is not present in their uploaded documents.
                
                CONTEXT FROM STUDY MATERIALS:
                %s
                
                STUDENT QUESTION:
                %s
                
                ANSWER:
                """, contextBuilder.toString(), question);

        String answer = geminiService.generateText(prompt);

        return ChatResponse.builder()
                .answer(answer)
                .sources(sources)
                .build();
    }
}
