package com.synapse.backend.ai;

import com.synapse.backend.file.StudyMaterial;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service layer responsible for managing the lifecycle of {@link DocumentChunk}
 * entities associated with a {@link StudyMaterial}.
 *
 * <p>Acts as the boundary between the text-chunking pipeline (which produces
 * raw text fragments via {@code TextChunkingService}) and persistence,
 * converting plain text chunks into {@link DocumentChunk} entities and
 * providing read, count, existence, and deletion operations used elsewhere
 * in the RAG pipeline (e.g. embedding generation).
 */
@Service
public class DocumentChunkService {

    private final DocumentChunkRepository documentChunkRepository;

    /**
     * Creates the service with its required repository dependency.
     *
     * @param documentChunkRepository repository used to persist and query
     *                                {@link DocumentChunk} entities
     */
    public DocumentChunkService(DocumentChunkRepository documentChunkRepository) {
        this.documentChunkRepository = documentChunkRepository;
    }

    /**
     * Converts a list of raw text chunks (as produced by the text-chunking
     * pipeline) into {@link DocumentChunk} entities linked to the given
     * {@link StudyMaterial}, and persists them in a single batch.
     *
     * <p>Each chunk is assigned a sequential {@code chunkIndex} matching its
     * position in the input list, and an initial {@code embeddingStatus} of
     * {@code "PENDING"}, marking it as awaiting embedding generation.
     *
     * @param studyMaterial the parent study material the chunks belong to
     * @param chunks        the ordered list of raw text chunks to persist
     * @return the saved {@link DocumentChunk} entities, in the same order
     *         as the input list; an empty list if {@code chunks} is empty
     */
    @Transactional
    public List<DocumentChunk> saveChunks(StudyMaterial studyMaterial, List<String> chunks) {
        List<DocumentChunk> documentChunks = new ArrayList<>(chunks.size());

        for (int index = 0; index < chunks.size(); index++) {
            DocumentChunk documentChunk = DocumentChunk.builder()
                    .studyMaterial(studyMaterial)
                    .chunkIndex(index)
                    .chunkText(chunks.get(index))
                    .embeddingStatus("PENDING")
                    .build();
            documentChunks.add(documentChunk);
        }

        return documentChunkRepository.saveAll(documentChunks);
    }

    /**
     * Retrieves all chunks belonging to the given study material, ordered
     * by their original position within the document.
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return chunks ordered by {@code chunkIndex} ascending; an empty list
     *         if none exist
     */
    @Transactional(readOnly = true)
    public List<DocumentChunk> getChunks(Long studyMaterialId) {
        return documentChunkRepository.findByStudyMaterialIdOrderByChunkIndexAsc(studyMaterialId);
    }

    /**
     * Counts the number of chunks associated with the given study material.
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return the number of chunks belonging to the study material
     */
    @Transactional(readOnly = true)
    public long countChunks(Long studyMaterialId) {
        return documentChunkRepository.countByStudyMaterialId(studyMaterialId);
    }

    /**
     * Checks whether the given study material has already been chunked.
     *
     * @param studyMaterialId the identifier of the parent study material
     * @return {@code true} if at least one chunk exists, {@code false}
     *         otherwise
     */
    @Transactional(readOnly = true)
    public boolean hasChunks(Long studyMaterialId) {
        return documentChunkRepository.existsByStudyMaterialId(studyMaterialId);
    }

    /**
     * Deletes all chunks associated with the given study material.
     *
     * <p>Typically invoked before re-chunking a document (e.g. on
     * re-upload or re-processing) to avoid stale or duplicate chunks.
     *
     * @param studyMaterialId the identifier of the parent study material
     *                        whose chunks should be removed
     */
    @Transactional
    public void deleteChunks(Long studyMaterialId) {
        documentChunkRepository.deleteByStudyMaterialId(studyMaterialId);
    }
}