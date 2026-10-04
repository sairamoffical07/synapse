package com.synapse.backend.chroma;

import java.util.HashMap;
import java.util.Map;

public class ChromaDocumentMetadata {

    private Long studyMaterialId;
    private Integer chunkIndex;
    private String fileName;
    private Long userId;

    public ChromaDocumentMetadata() {
    }

    public ChromaDocumentMetadata(Long studyMaterialId, Integer chunkIndex, String fileName, Long userId) {
        this.studyMaterialId = studyMaterialId;
        this.chunkIndex = chunkIndex;
        this.fileName = fileName;
        this.userId = userId;
    }

    public static ChromaDocumentMetadataBuilder builder() {
        return new ChromaDocumentMetadataBuilder();
    }

    public static class ChromaDocumentMetadataBuilder {
        private Long studyMaterialId;
        private Integer chunkIndex;
        private String fileName;
        private Long userId;

        public ChromaDocumentMetadataBuilder studyMaterialId(Long studyMaterialId) {
            this.studyMaterialId = studyMaterialId;
            return this;
        }

        public ChromaDocumentMetadataBuilder chunkIndex(Integer chunkIndex) {
            this.chunkIndex = chunkIndex;
            return this;
        }

        public ChromaDocumentMetadataBuilder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public ChromaDocumentMetadataBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public ChromaDocumentMetadata build() {
            return new ChromaDocumentMetadata(studyMaterialId, chunkIndex, fileName, userId);
        }
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        if (studyMaterialId != null) map.put("studyMaterialId", studyMaterialId);
        if (chunkIndex != null) map.put("chunkIndex", chunkIndex);
        if (fileName != null) map.put("fileName", fileName);
        if (userId != null) map.put("userId", userId);
        return map;
    }

    public static ChromaDocumentMetadata fromMap(Map<String, Object> map) {
        if (map == null) return new ChromaDocumentMetadata();
        
        Long studyMaterialId = map.get("studyMaterialId") != null ? ((Number) map.get("studyMaterialId")).longValue() : null;
        Integer chunkIndex = map.get("chunkIndex") != null ? ((Number) map.get("chunkIndex")).intValue() : null;
        String fileName = map.get("fileName") != null ? map.get("fileName").toString() : null;
        Long userId = map.get("userId") != null ? ((Number) map.get("userId")).longValue() : null;

        return ChromaDocumentMetadata.builder()
                .studyMaterialId(studyMaterialId)
                .chunkIndex(chunkIndex)
                .fileName(fileName)
                .userId(userId)
                .build();
    }

    public Long getStudyMaterialId() {
        return studyMaterialId;
    }

    public void setStudyMaterialId(Long studyMaterialId) {
        this.studyMaterialId = studyMaterialId;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
