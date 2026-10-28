package com.synapse.backend.exception;

public class AIServiceException extends RuntimeException {
    private final int status;

    public AIServiceException(String message) {
        this(message, 502);
    }

    public AIServiceException(String message, Throwable cause) {
        this(message, 502, cause);
    }

    public AIServiceException(String message, int status) {
        super(message);
        this.status = status;
    }

    public AIServiceException(String message, int status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
