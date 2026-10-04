package com.synapse.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.backend.chroma.ChromaQueryResult;
import com.synapse.backend.dto.FlashcardDTO;
import com.synapse.backend.dto.FlashcardResponseDTO;
import com.synapse.backend.entity.User;
import com.synapse.backend.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FlashcardGenerationService {

    private static final Logger log = LoggerFactory.getLogger(FlashcardGenerationService.class);

    private final SemanticSearchService semanticSearchService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public FlashcardGenerationService(
            SemanticSearchService semanticSearchService,
            GeminiService geminiService,
            ObjectMapper objectMapper) {
        this.semanticSearchService = semanticSearchService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public FlashcardResponseDTO generateFlashcards(String topic, int count, User user) {
        log.info("Generating flashcards for user [userId={}, topic='{}', count={}]", user.getId(), topic, count);

        List<ChromaQueryResult> chunks = semanticSearchService.searchSimilarChunks(topic, 5, user.getId());
        if (chunks.isEmpty()) {
            throw new AIServiceException("No relevant study materials found for topic: " + topic);
        }

        StringBuilder contextBuilder = new StringBuilder();
        for (ChromaQueryResult chunk : chunks) {
            contextBuilder.append(chunk.getDocumentText()).append("\n\n");
        }

        String prompt = String.format("""
                You are an academic flashcard creator.
                Based strictly on the following study context, generate %d revision flashcards on the topic: "%s".
                
                STUDY CONTEXT:
                %s
                
                Respond ONLY with a valid JSON object matching this exact structure (no markdown code fences, no extra text):
                {
                  "topic": "%s",
                  "flashcards": [
                    {
                      "front": "Question/Prompt for front of flashcard",
                      "back": "Key concept/Answer for back of flashcard"
                    }
                  ]
                }
                """, count, topic, contextBuilder.toString(), topic);

        String jsonResponse = geminiService.generateText(prompt);
        jsonResponse = cleanJsonResponse(jsonResponse);

        try {
            return objectMapper.readValue(jsonResponse, FlashcardResponseDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse JSON flashcards response from Gemini", e);
            return FlashcardResponseDTO.builder()
                    .topic(topic)
                    .flashcards(List.of(
                            FlashcardDTO.builder()
                                    .front("What is " + topic + "?")
                                    .back("Core concept extracted from study materials.")
                                    .build()
                    ))
                    .build();
        }
    }

    private String cleanJsonResponse(String json) {
        if (json == null) return "{}";
        String trimmed = json.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
