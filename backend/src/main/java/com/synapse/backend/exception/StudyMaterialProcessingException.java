package com.synapse.backend.exception;

public class StudyMaterialProcessingException extends RuntimeException {
    public StudyMaterialProcessingException(String message) {
        super(message);
    }

    public StudyMaterialProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
