package com.synapse.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.backend.chroma.ChromaQueryResult;
import com.synapse.backend.dto.FlashcardDTO;
import com.synapse.backend.dto.FlashcardResponseDTO;
import com.synapse.backend.entity.User;
import com.synapse.backend.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            List<FlashcardDTO> cards = new ArrayList<>();

            JsonNode cardsNode = null;
            if (rootNode.isArray()) {
                cardsNode = rootNode;
            } else if (rootNode.isObject()) {
                if (rootNode.has("flashcards") && rootNode.get("flashcards").isArray()) {
                    cardsNode = rootNode.get("flashcards");
                } else if (rootNode.has("cards") && rootNode.get("cards").isArray()) {
                    cardsNode = rootNode.get("cards");
                } else if (rootNode.has("items") && rootNode.get("items").isArray()) {
                    cardsNode = rootNode.get("items");
                } else if (rootNode.has("data")) {
                    JsonNode dataNode = rootNode.get("data");
                    if (dataNode.isArray()) {
                        cardsNode = dataNode;
                    } else if (dataNode.isObject() && dataNode.has("flashcards") && dataNode.get("flashcards").isArray()) {
                        cardsNode = dataNode.get("flashcards");
                    }
                }
            }

            if (cardsNode != null && cardsNode.isArray()) {
                for (JsonNode cNode : cardsNode) {
                    String front = "";
                    if (cNode.has("front")) front = cNode.get("front").asText();
                    else if (cNode.has("question")) front = cNode.get("question").asText();
                    else if (cNode.has("concept")) front = cNode.get("concept").asText();
                    else if (cNode.has("prompt")) front = cNode.get("prompt").asText();
                    else if (cNode.has("title")) front = cNode.get("title").asText();

                    String back = "";
                    if (cNode.has("back")) back = cNode.get("back").asText();
                    else if (cNode.has("answer")) back = cNode.get("answer").asText();
                    else if (cNode.has("explanation")) back = cNode.get("explanation").asText();
                    else if (cNode.has("definition")) back = cNode.get("definition").asText();

                    if (!front.isBlank() && !back.isBlank()) {
                        cards.add(FlashcardDTO.builder()
                                .front(front.trim())
                                .back(back.trim())
                                .build());
                    }
                }
            }

            if (cards.isEmpty()) {
                throw new AIServiceException("Could not extract valid flashcards from AI response.");
            }

            return FlashcardResponseDTO.builder()
                    .topic(topic)
                    .flashcards(cards)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse JSON flashcards response from Gemini", e);
            throw new AIServiceException("Failed to generate flashcards: " + e.getMessage(), e);
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
