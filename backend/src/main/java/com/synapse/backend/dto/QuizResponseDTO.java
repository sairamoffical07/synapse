package com.synapse.backend.dto;

import java.util.List;

public class QuizResponseDTO {

    private String topic;
    private List<QuizQuestionDTO> questions;

    public QuizResponseDTO() {
    }

    public QuizResponseDTO(String topic, List<QuizQuestionDTO> questions) {
        this.topic = topic;
        this.questions = questions;
    }

    public static QuizResponseDTOBuilder builder() {
        return new QuizResponseDTOBuilder();
    }

    public static class QuizResponseDTOBuilder {
        private String topic;
        private List<QuizQuestionDTO> questions;

        public QuizResponseDTOBuilder topic(String topic) {
            this.topic = topic;
            return this;
        }

        public QuizResponseDTOBuilder questions(List<QuizQuestionDTO> questions) {
            this.questions = questions;
            return this;
        }

        public QuizResponseDTO build() {
            return new QuizResponseDTO(topic, questions);
        }
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public List<QuizQuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestionDTO> questions) {
        this.questions = questions;
    }
}
