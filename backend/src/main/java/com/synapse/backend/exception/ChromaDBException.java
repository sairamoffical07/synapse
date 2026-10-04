package com.synapse.backend.exception;

public class ChromaDBException extends RuntimeException {
    public ChromaDBException(String message) {
        super(message);
    }

    public ChromaDBException(String message, Throwable cause) {
        super(message, cause);
    }
}
