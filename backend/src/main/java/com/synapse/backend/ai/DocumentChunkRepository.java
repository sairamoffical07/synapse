package com.synapse.backend.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Data JPA repository for {@link DocumentChunk} entities.
 *
 * <p>Provides CRUD operations inherited from {@link JpaRepository}, plus a
 * set of query and mutation methods derived purely from Spring Data JPA
 * naming conventions — used throughout the chunking and embedding pipeline
 * to retrieve, count, and manage chunks belonging to a given
 * {@code StudyMaterial}.
 */
@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    /**
     * Retrieves all chunks belonging to the given study material, ordered
     * by their position within the original document.
     *
     * <p>Use this when the chunks need to be processed or displayed in
     * reading order (e.g. reassembling text, sequential embedding
     * generation, or rendering to the user).
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return chunks for the given study material, ordered by
     *         {@code chunkIndex} ascending; an empty list if none exist
     */
    List<DocumentChunk> findByStudyMaterialIdOrderByChunkIndexAsc(Long studyMaterialId);

    /**
     * Retrieves all chunks currently in the given embedding pipeline
     * status.
     *
     * <p>Typically used by background jobs to find chunks awaiting
     * processing (e.g. {@code "PENDING"}) or to identify failures
     * (e.g. {@code "FAILED"}) for retry.
     *
     * @param embeddingStatus the embedding status to filter by
     *                        (e.g. {@code "PENDING"}, {@code "PROCESSING"},
     *                        {@code "COMPLETED"}, {@code "FAILED"})
     * @return chunks matching the given status; an empty list if none exist
     */
    List<DocumentChunk> findByEmbeddingStatus(String embeddingStatus);

    /**
     * Counts the number of chunks belonging to the given study material.
     *
     * <p>Useful for progress tracking (e.g. reporting how many chunks a
     * document was split into) without loading the chunk entities
     * themselves.
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return the number of chunks associated with the study material
     */
    long countByStudyMaterialId(Long studyMaterialId);

    /**
     * Deletes all chunks belonging to the given study material.
     *
     * <p>Intended for re-processing scenarios (e.g. a document is
     * re-uploaded or re-chunked) where existing chunks must be removed
     * before new ones are inserted. Runs within a transaction so the
     * bulk delete is atomic.
     *
     * @param studyMaterialId the identifier of the parent study material
     *                        whose chunks should be deleted
     */
    @Transactional
    void deleteByStudyMaterialId(Long studyMaterialId);

    /**
     * Checks whether at least one chunk exists for the given study
     * material.
     *
     * <p>More efficient than {@link #countByStudyMaterialId(Long)} or
     * loading the chunk list when only presence needs to be verified —
     * for example, to decide whether a document has already been chunked
     * before triggering the chunking pipeline again.
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return {@code true} if at least one chunk exists for the study
     *         material, {@code false} otherwise
     */
    boolean existsByStudyMaterialId(Long studyMaterialId);

    /**
     * Retrieves all chunks belonging to the given study material, in no
     * guaranteed order.
     *
     * <p>Prefer {@link #findByStudyMaterialIdOrderByChunkIndexAsc(Long)}
     * when reading order matters; use this variant when order is
     * irrelevant (e.g. bulk operations, counting, or set-based checks)
     * to avoid the unnecessary {@code ORDER BY} overhead.
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return chunks for the given study material, in unspecified order;
     *         an empty list if none exist
     */
    List<DocumentChunk> findByStudyMaterialId(Long studyMaterialId);
}