package com.synapse.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class FlashcardRequest {

    @NotBlank(message = "Topic must not be blank")
    private String topic;

    private Integer count = 5;

    public FlashcardRequest() {
    }

    public FlashcardRequest(String topic, Integer count) {
        this.topic = topic;
        this.count = count != null ? count : 5;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
