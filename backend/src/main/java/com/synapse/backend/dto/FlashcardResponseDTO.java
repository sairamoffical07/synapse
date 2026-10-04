package com.synapse.backend.dto;

import java.util.List;

public class FlashcardResponseDTO {

    private String topic;
    private List<FlashcardDTO> flashcards;

    public FlashcardResponseDTO() {
    }

    public FlashcardResponseDTO(String topic, List<FlashcardDTO> flashcards) {
        this.topic = topic;
        this.flashcards = flashcards;
    }

    public static FlashcardResponseDTOBuilder builder() {
        return new FlashcardResponseDTOBuilder();
    }

    public static class FlashcardResponseDTOBuilder {
        private String topic;
        private List<FlashcardDTO> flashcards;

        public FlashcardResponseDTOBuilder topic(String topic) {
            this.topic = topic;
            return this;
        }

        public FlashcardResponseDTOBuilder flashcards(List<FlashcardDTO> flashcards) {
            this.flashcards = flashcards;
            return this;
        }

        public FlashcardResponseDTO build() {
            return new FlashcardResponseDTO(topic, flashcards);
        }
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public List<FlashcardDTO> getFlashcards() {
        return flashcards;
    }

    public void setFlashcards(List<FlashcardDTO> flashcards) {
        this.flashcards = flashcards;
    }
}
