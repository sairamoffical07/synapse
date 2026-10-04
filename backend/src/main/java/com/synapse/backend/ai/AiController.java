package com.synapse.backend.ai;

import com.synapse.backend.dto.ApiResponse;
import com.synapse.backend.dto.ChatRequest;
import com.synapse.backend.dto.ChatResponse;
import com.synapse.backend.dto.FlashcardRequest;
import com.synapse.backend.dto.FlashcardResponseDTO;
import com.synapse.backend.dto.QuizRequest;
import com.synapse.backend.dto.QuizResponseDTO;
import com.synapse.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final RagService ragService;
    private final QuizGenerationService quizGenerationService;
    private final FlashcardGenerationService flashcardGenerationService;

    public AiController(RagService ragService, QuizGenerationService quizGenerationService, FlashcardGenerationService flashcardGenerationService) {
        this.ragService = ragService;
        this.quizGenerationService = quizGenerationService;
        this.flashcardGenerationService = flashcardGenerationService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ChatResponse response = ragService.answerQuestion(request.getQuestion(), userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("AI response generated successfully", response));
    }

    @PostMapping("/quiz")
    public ResponseEntity<ApiResponse<QuizResponseDTO>> generateQuiz(
            @Valid @RequestBody QuizRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int count = (request.getCount() != null && request.getCount() > 0) ? request.getCount() : 5;
        QuizResponseDTO quiz = quizGenerationService.generateQuiz(request.getTopic(), count, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Quiz generated successfully", quiz));
    }

    @PostMapping("/flashcards")
    public ResponseEntity<ApiResponse<FlashcardResponseDTO>> generateFlashcards(
            @Valid @RequestBody FlashcardRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int count = (request.getCount() != null && request.getCount() > 0) ? request.getCount() : 5;
        FlashcardResponseDTO flashcards = flashcardGenerationService.generateFlashcards(request.getTopic(), count, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Flashcards generated successfully", flashcards));
    }
}
