package com.synapse.backend.dto;

import com.synapse.backend.file.StudyMaterial;

import java.time.LocalDateTime;

public class StudyMaterialDTO {

    private Long id;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String processingStatus;
    private LocalDateTime uploadedAt;

    public StudyMaterialDTO() {
    }

    public StudyMaterialDTO(Long id, String originalFileName, String fileType, Long fileSize, String processingStatus, LocalDateTime uploadedAt) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.processingStatus = processingStatus;
        this.uploadedAt = uploadedAt;
    }

    public static StudyMaterialDTOBuilder builder() {
        return new StudyMaterialDTOBuilder();
    }

    public static class StudyMaterialDTOBuilder {
        private Long id;
        private String originalFileName;
        private String fileType;
        private Long fileSize;
        private String processingStatus;
        private LocalDateTime uploadedAt;

        public StudyMaterialDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public StudyMaterialDTOBuilder originalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
            return this;
        }

        public StudyMaterialDTOBuilder fileType(String fileType) {
            this.fileType = fileType;
            return this;
        }

        public StudyMaterialDTOBuilder fileSize(Long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public StudyMaterialDTOBuilder processingStatus(String processingStatus) {
            this.processingStatus = processingStatus;
            return this;
        }

        public StudyMaterialDTOBuilder uploadedAt(LocalDateTime uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public StudyMaterialDTO build() {
            return new StudyMaterialDTO(id, originalFileName, fileType, fileSize, processingStatus, uploadedAt);
        }
    }

    public static StudyMaterialDTO fromEntity(StudyMaterial material) {
        if (material == null) return null;

        return StudyMaterialDTO.builder()
                .id(material.getId())
                .originalFileName(material.getOriginalFileName())
                .fileType(material.getFileType())
                .fileSize(material.getFileSize())
                .processingStatus(material.getProcessingStatus())
                .uploadedAt(material.getUploadedAt())
                .build();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
