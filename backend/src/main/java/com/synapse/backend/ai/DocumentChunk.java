package com.synapse.backend.ai;

import com.synapse.backend.file.StudyMaterial;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "document_chunks",
        indexes = {
                @Index(name = "idx_document_chunk_material", columnList = "study_material_id"),
                @Index(name = "idx_document_chunk_status", columnList = "embedding_status")
        }
)
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_material_id", nullable = false)
    private StudyMaterial studyMaterial;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Lob
    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;

    @Column(name = "embedding_status", nullable = false, length = 32)
    private String embeddingStatus = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DocumentChunk() {
    }

    public DocumentChunk(Long id, StudyMaterial studyMaterial, Integer chunkIndex, String chunkText, String embeddingStatus, LocalDateTime createdAt) {
        this.id = id;
        this.studyMaterial = studyMaterial;
        this.chunkIndex = chunkIndex;
        this.chunkText = chunkText;
        this.embeddingStatus = embeddingStatus != null ? embeddingStatus : "PENDING";
        this.createdAt = createdAt;
    }

    public static DocumentChunkBuilder builder() {
        return new DocumentChunkBuilder();
    }

    public static class DocumentChunkBuilder {
        private Long id;
        private StudyMaterial studyMaterial;
        private Integer chunkIndex;
        private String chunkText;
        private String embeddingStatus = "PENDING";
        private LocalDateTime createdAt;

        public DocumentChunkBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public DocumentChunkBuilder studyMaterial(StudyMaterial studyMaterial) {
            this.studyMaterial = studyMaterial;
            return this;
        }

        public DocumentChunkBuilder chunkIndex(Integer chunkIndex) {
            this.chunkIndex = chunkIndex;
            return this;
        }

        public DocumentChunkBuilder chunkText(String chunkText) {
            this.chunkText = chunkText;
            return this;
        }

        public DocumentChunkBuilder embeddingStatus(String embeddingStatus) {
            this.embeddingStatus = embeddingStatus;
            return this;
        }

        public DocumentChunkBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public DocumentChunk build() {
            return new DocumentChunk(id, studyMaterial, chunkIndex, chunkText, embeddingStatus, createdAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.embeddingStatus == null) {
            this.embeddingStatus = "PENDING";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudyMaterial getStudyMaterial() {
        return studyMaterial;
    }

    public void setStudyMaterial(StudyMaterial studyMaterial) {
        this.studyMaterial = studyMaterial;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getChunkText() {
        return chunkText;
    }

    public void setChunkText(String chunkText) {
        this.chunkText = chunkText;
    }

    public String getEmbeddingStatus() {
        return embeddingStatus;
    }

    public void setEmbeddingStatus(String embeddingStatus) {
        this.embeddingStatus = embeddingStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}