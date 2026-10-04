package com.synapse.backend.dto;

import java.util.List;

public class QuizQuestionDTO {

    private String question;
    private List<String> options;
    private Integer correctOptionIndex;
    private String explanation;

    public QuizQuestionDTO() {
    }

    public QuizQuestionDTO(String question, List<String> options, Integer correctOptionIndex, String explanation) {
        this.question = question;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
        this.explanation = explanation;
    }

    public static QuizQuestionDTOBuilder builder() {
        return new QuizQuestionDTOBuilder();
    }

    public static class QuizQuestionDTOBuilder {
        private String question;
        private List<String> options;
        private Integer correctOptionIndex;
        private String explanation;

        public QuizQuestionDTOBuilder question(String question) {
            this.question = question;
            return this;
        }

        public QuizQuestionDTOBuilder options(List<String> options) {
            this.options = options;
            return this;
        }

        public QuizQuestionDTOBuilder correctOptionIndex(Integer correctOptionIndex) {
            this.correctOptionIndex = correctOptionIndex;
            return this;
        }

        public QuizQuestionDTOBuilder explanation(String explanation) {
            this.explanation = explanation;
            return this;
        }

        public QuizQuestionDTO build() {
            return new QuizQuestionDTO(question, options, correctOptionIndex, explanation);
        }
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Integer getCorrectOptionIndex() {
        return correctOptionIndex;
    }

    public void setCorrectOptionIndex(Integer correctOptionIndex) {
        this.correctOptionIndex = correctOptionIndex;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
