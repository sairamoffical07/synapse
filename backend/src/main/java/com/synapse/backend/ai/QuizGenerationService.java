package com.synapse.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.backend.chroma.ChromaQueryResult;
import com.synapse.backend.dto.QuizQuestionDTO;
import com.synapse.backend.dto.QuizResponseDTO;
import com.synapse.backend.entity.User;
import com.synapse.backend.exception.AIServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            List<QuizQuestionDTO> questions = new ArrayList<>();

            JsonNode questionsNode = null;
            if (rootNode.isArray()) {
                questionsNode = rootNode;
            } else if (rootNode.isObject()) {
                if (rootNode.has("questions") && rootNode.get("questions").isArray()) {
                    questionsNode = rootNode.get("questions");
                } else if (rootNode.has("quiz") && rootNode.get("quiz").isArray()) {
                    questionsNode = rootNode.get("quiz");
                } else if (rootNode.has("items") && rootNode.get("items").isArray()) {
                    questionsNode = rootNode.get("items");
                }
            }

            if (questionsNode != null && questionsNode.isArray()) {
                for (JsonNode qNode : questionsNode) {
                    String questionText = qNode.has("question") ? qNode.get("question").asText()
                            : (qNode.has("prompt") ? qNode.get("prompt").asText() : "");

                    List<String> options = new ArrayList<>();
                    if (qNode.has("options") && qNode.get("options").isArray()) {
                        for (JsonNode opt : qNode.get("options")) {
                            options.add(opt.asText());
                        }
                    }

                    Integer correctIndex = null;
                    if (qNode.has("correctOptionIndex") && qNode.get("correctOptionIndex").isInt()) {
                        correctIndex = qNode.get("correctOptionIndex").asInt();
                    } else if (qNode.has("correctIndex") && qNode.get("correctIndex").isInt()) {
                        correctIndex = qNode.get("correctIndex").asInt();
                    } else if (qNode.has("correct_index") && qNode.get("correct_index").isInt()) {
                        correctIndex = qNode.get("correct_index").asInt();
                    } else if (qNode.has("answerIndex") && qNode.get("answerIndex").isInt()) {
                        correctIndex = qNode.get("answerIndex").asInt();
                    }

                    if (correctIndex == null) {
                        correctIndex = 0;
                    }

                    String explanation = qNode.has("explanation") ? qNode.get("explanation").asText() : "";

                    if (!questionText.isEmpty() && !options.isEmpty()) {
                        questions.add(QuizQuestionDTO.builder()
                                .question(questionText)
                                .options(options)
                                .correctOptionIndex(correctIndex)
                                .explanation(explanation)
                                .build());
                    }
                }
            }

            if (questions.isEmpty()) {
                throw new AIServiceException("AI generated empty or invalid quiz question format.");
            }

            return QuizResponseDTO.builder()
                    .topic(topic)
                    .questions(questions)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse JSON quiz response from Gemini", e);
            throw new AIServiceException("Failed to generate quiz questions: " + e.getMessage(), e);
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
