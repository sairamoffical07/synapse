package com.synapse.backend.chroma;

public class ChromaQueryResult {

    private String id;
    private String documentText;
    private ChromaDocumentMetadata metadata;
    private Double distance;

    public ChromaQueryResult() {
    }

    public ChromaQueryResult(String id, String documentText, ChromaDocumentMetadata metadata, Double distance) {
        this.id = id;
        this.documentText = documentText;
        this.metadata = metadata;
        this.distance = distance;
    }

    public static ChromaQueryResultBuilder builder() {
        return new ChromaQueryResultBuilder();
    }

    public static class ChromaQueryResultBuilder {
        private String id;
        private String documentText;
        private ChromaDocumentMetadata metadata;
        private Double distance;

        public ChromaQueryResultBuilder id(String id) {
            this.id = id;
            return this;
        }

        public ChromaQueryResultBuilder documentText(String documentText) {
            this.documentText = documentText;
            return this;
        }

        public ChromaQueryResultBuilder metadata(ChromaDocumentMetadata metadata) {
            this.metadata = metadata;
            return this;
        }

        public ChromaQueryResultBuilder distance(Double distance) {
            this.distance = distance;
            return this;
        }

        public ChromaQueryResult build() {
            return new ChromaQueryResult(id, documentText, metadata, distance);
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

    public ChromaDocumentMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(ChromaDocumentMetadata metadata) {
        this.metadata = metadata;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }
}
