package com.synapse.backend.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.backend.chroma.ChromaQueryResult;
import com.synapse.backend.dto.QuizQuestionDTO;
import com.synapse.backend.dto.QuizResponseDTO;
import com.synapse.backend.entity.User;
import com.synapse.backend.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizGenerationService {

    private static final Logger log = LoggerFactory.getLogger(QuizGenerationService.class);

    private final SemanticSearchService semanticSearchService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public QuizGenerationService(
            SemanticSearchService semanticSearchService,
            GeminiService geminiService,
            ObjectMapper objectMapper) {
        this.semanticSearchService = semanticSearchService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public QuizResponseDTO generateQuiz(String topic, int numberOfQuestions, User user) {
        log.info("Generating quiz for user [userId={}, topic='{}', questions={}]", user.getId(), topic, numberOfQuestions);

        List<ChromaQueryResult> chunks = semanticSearchService.searchSimilarChunks(topic, 5, user.getId());
        if (chunks.isEmpty()) {
            throw new AIServiceException("No relevant study materials found for topic: " + topic);
        }

        StringBuilder contextBuilder = new StringBuilder();
        for (ChromaQueryResult chunk : chunks) {
            contextBuilder.append(chunk.getDocumentText()).append("\n\n");
        }

        String prompt = String.format("""
                You are an academic test generator.
                Based strictly on the following study context, generate %d multiple-choice quiz questions on the topic: "%s".
                
                STUDY CONTEXT:
                %s
                
                Respond ONLY with a valid JSON object matching this exact structure (no markdown code fences, no extra text):
                {
                  "topic": "%s",
                  "questions": [
                    {
                      "question": "Question text here",
                      "options": ["Option A", "Option B", "Option C", "Option D"],
                      "correctOptionIndex": 0,
                      "explanation": "Explanation here"
                    }
                  ]
                }
                """, numberOfQuestions, topic, contextBuilder.toString(), topic);

        String jsonResponse = geminiService.generateText(prompt);
        jsonResponse = cleanJsonResponse(jsonResponse);

        try {
            return objectMapper.readValue(jsonResponse, QuizResponseDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse JSON quiz response from Gemini", e);
            return QuizResponseDTO.builder()
                    .topic(topic)
                    .questions(List.of(
                            QuizQuestionDTO.builder()
                                    .question("Sample Question on " + topic)
                                    .options(List.of("Option A", "Option B", "Option C", "Option D"))
                                    .correctOptionIndex(0)
                                    .explanation("Generated from context")
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
