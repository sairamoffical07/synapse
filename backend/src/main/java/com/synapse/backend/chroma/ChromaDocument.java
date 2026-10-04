package com.synapse.backend.chroma;

import java.util.List;

public class ChromaDocument {

    private String id;
    private String documentText;
    private List<Float> embedding;
    private ChromaDocumentMetadata metadata;

    public ChromaDocument() {
    }

    public ChromaDocument(String id, String documentText, List<Float> embedding, ChromaDocumentMetadata metadata) {
        this.id = id;
        this.documentText = documentText;
        this.embedding = embedding;
        this.metadata = metadata;
    }

    public static ChromaDocumentBuilder builder() {
        return new ChromaDocumentBuilder();
    }

    public static class ChromaDocumentBuilder {
        private String id;
        private String documentText;
        private List<Float> embedding;
        private ChromaDocumentMetadata metadata;

        public ChromaDocumentBuilder id(String id) {
            this.id = id;
            return this;
        }

        public ChromaDocumentBuilder documentText(String documentText) {
            this.documentText = documentText;
            return this;
        }

        public ChromaDocumentBuilder embedding(List<Float> embedding) {
            this.embedding = embedding;
            return this;
        }

        public ChromaDocumentBuilder metadata(ChromaDocumentMetadata metadata) {
            this.metadata = metadata;
            return this;
        }

        public ChromaDocument build() {
            return new ChromaDocument(id, documentText, embedding, metadata);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDocumentText() {
        return documentText;
    }

    public void setDocumentText(String documentText) {
        this.documentText = documentText;
    }

    public List<Float> getEmbedding() {
        return embedding;
    }

    public void setEmbedding(List<Float> embedding) {
        this.embedding = embedding;
    }

    public ChromaDocumentMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(ChromaDocumentMetadata metadata) {
        this.metadata = metadata;
    }
}
