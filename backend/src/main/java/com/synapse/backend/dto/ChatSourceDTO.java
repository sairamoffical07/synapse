package com.synapse.backend.dto;

public class ChatSourceDTO {

    private Long studyMaterialId;
    private String fileName;
    private Integer chunkIndex;

    public ChatSourceDTO() {
    }

    public ChatSourceDTO(Long studyMaterialId, String fileName, Integer chunkIndex) {
        this.studyMaterialId = studyMaterialId;
        this.fileName = fileName;
        this.chunkIndex = chunkIndex;
    }

    public static ChatSourceDTOBuilder builder() {
        return new ChatSourceDTOBuilder();
    }

    public static class ChatSourceDTOBuilder {
        private Long studyMaterialId;
        private String fileName;
        private Integer chunkIndex;

        public ChatSourceDTOBuilder studyMaterialId(Long studyMaterialId) {
            this.studyMaterialId = studyMaterialId;
            return this;
        }

        public ChatSourceDTOBuilder fileName(String fileName) {
            this.fileName = fileName;
            return this;
        }

        public ChatSourceDTOBuilder chunkIndex(Integer chunkIndex) {
            this.chunkIndex = chunkIndex;
            return this;
        }

        public ChatSourceDTO build() {
            return new ChatSourceDTO(studyMaterialId, fileName, chunkIndex);
        }
    }

    public Long getStudyMaterialId() {
        return studyMaterialId;
    }

    public void setStudyMaterialId(Long studyMaterialId) {
        this.studyMaterialId = studyMaterialId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }
}
