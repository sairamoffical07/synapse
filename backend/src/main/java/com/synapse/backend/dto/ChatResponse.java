package com.synapse.backend.dto;

import java.util.List;

public class ChatResponse {

    private String answer;
    private List<ChatSourceDTO> sources;

    public ChatResponse() {
    }

    public ChatResponse(String answer, List<ChatSourceDTO> sources) {
        this.answer = answer;
        this.sources = sources;
    }

    public static ChatResponseBuilder builder() {
        return new ChatResponseBuilder();
    }

    public static class ChatResponseBuilder {
        private String answer;
        private List<ChatSourceDTO> sources;

        public ChatResponseBuilder answer(String answer) {
            this.answer = answer;
            return this;
        }

        public ChatResponseBuilder sources(List<ChatSourceDTO> sources) {
            this.sources = sources;
            return this;
        }

        public ChatResponse build() {
            return new ChatResponse(answer, sources);
        }
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<ChatSourceDTO> getSources() {
        return sources;
    }

    public void setSources(List<ChatSourceDTO> sources) {
        this.sources = sources;
    }
}
