package com.synapse.backend.dto;

public class FlashcardDTO {

    private String front;
    private String back;

    public FlashcardDTO() {
    }

    public FlashcardDTO(String front, String back) {
        this.front = front;
        this.back = back;
    }

    public static FlashcardDTOBuilder builder() {
        return new FlashcardDTOBuilder();
    }

    public static class FlashcardDTOBuilder {
        private String front;
        private String back;

        public FlashcardDTOBuilder front(String front) {
            this.front = front;
            return this;
        }

        public FlashcardDTOBuilder back(String back) {
            this.back = back;
            return this;
        }

        public FlashcardDTO build() {
            return new FlashcardDTO(front, back);
        }
    }

    public String getFront() {
        return front;
    }

    public void setFront(String front) {
        this.front = front;
    }

    public String getBack() {
        return back;
    }

    public void setBack(String back) {
        this.back = back;
    }
}
