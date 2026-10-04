package com.synapse.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByStudyMaterialIdOrderByChunkIndexAsc(Long studyMaterialId);

    List<DocumentChunk> findByEmbeddingStatus(String embeddingStatus);

    long countByStudyMaterialId(Long studyMaterialId);

    @Transactional
    void deleteByStudyMaterialId(Long studyMaterialId);

    boolean existsByStudyMaterialId(Long studyMaterialId);

    List<DocumentChunk> findByStudyMaterialId(Long studyMaterialId);

    List<DocumentChunk> findByStudyMaterialUserId(Long userId);
}