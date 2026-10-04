package com.synapse.backend.file;

import com.synapse.backend.ai.DocumentChunk;
import com.synapse.backend.ai.DocumentChunkService;
import com.synapse.backend.ai.EmbeddingService;
import com.synapse.backend.ai.TextChunkingService;
import com.synapse.backend.chroma.ChromaDBClient;
import com.synapse.backend.chroma.ChromaDocument;
import com.synapse.backend.chroma.ChromaDocumentMetadata;
import com.synapse.backend.dto.StudyMaterialDTO;
import com.synapse.backend.entity.User;
import com.synapse.backend.exception.ResourceNotFoundException;
import com.synapse.backend.exception.StudyMaterialProcessingException;
import com.synapse.backend.service.PdfTextExtractorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudyMaterialService {

    private static final Logger log = LoggerFactory.getLogger(StudyMaterialService.class);
    private static final String UPLOAD_DIRECTORY = "uploads";
    public static final String STATUS_PROCESSING = "PROCESSING";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_FAILED = "FAILED";

    private final StudyMaterialRepository studyMaterialRepository;
    private final PdfTextExtractorService pdfTextExtractorService;
    private final TextChunkingService textChunkingService;
    private final DocumentChunkService documentChunkService;
    private final EmbeddingService embeddingService;
    private final ChromaDBClient chromaDBClient;

    public StudyMaterialService(
            StudyMaterialRepository studyMaterialRepository,
            PdfTextExtractorService pdfTextExtractorService,
            TextChunkingService textChunkingService,
            DocumentChunkService documentChunkService,
            EmbeddingService embeddingService,
            ChromaDBClient chromaDBClient) {
        this.studyMaterialRepository = studyMaterialRepository;
        this.pdfTextExtractorService = pdfTextExtractorService;
        this.textChunkingService = textChunkingService;
        this.documentChunkService = documentChunkService;
        this.embeddingService = embeddingService;
        this.chromaDBClient = chromaDBClient;
    }

    @Transactional
    public StudyMaterialDTO uploadPDF(MultipartFile file, User user) {
        validateFile(file);

        String originalFileName = file.getOriginalFilename();
        String storedFileName = generateUniqueFileName(originalFileName);
        Path storedFilePath = resolveStoragePath(storedFileName);

        writeFileToDisk(file, storedFilePath);

        StudyMaterial studyMaterial = new StudyMaterial();
        studyMaterial.setUser(user);
        studyMaterial.setOriginalFileName(originalFileName);
        studyMaterial.setStoredFileName(storedFileName);
        studyMaterial.setFileType(file.getContentType() != null ? file.getContentType() : "application/pdf");
        studyMaterial.setFileSize(file.getSize());
        studyMaterial.setFilePath(storedFilePath.toString());
        studyMaterial.setProcessingStatus(STATUS_PROCESSING);
        studyMaterial.setUploadedAt(LocalDateTime.now());

        StudyMaterial savedMaterial = studyMaterialRepository.save(studyMaterial);

        try {
            String extractedText = pdfTextExtractorService.extractText(storedFilePath);
            savedMaterial.setExtractedText(extractedText);

            List<String> rawChunks = textChunkingService.splitIntoChunks(extractedText);
            if (rawChunks.isEmpty()) {
                throw new StudyMaterialProcessingException("Extracted document text produced zero chunks");
            }

            List<DocumentChunk> persistedChunks = documentChunkService.saveChunks(savedMaterial, rawChunks);

            List<String> chunkTexts = persistedChunks.stream().map(DocumentChunk::getChunkText).collect(Collectors.toList());
            List<List<Float>> embeddings = embeddingService.generateEmbeddings(chunkTexts);

            List<ChromaDocument> chromaDocs = new ArrayList<>();
            for (int i = 0; i < persistedChunks.size(); i++) {
                DocumentChunk chunk = persistedChunks.get(i);
                List<Float> embedding = i < embeddings.size() ? embeddings.get(i) : List.of();

                ChromaDocumentMetadata metadata = ChromaDocumentMetadata.builder()
                        .studyMaterialId(savedMaterial.getId())
                        .chunkIndex(chunk.getChunkIndex())
                        .fileName(originalFileName)
                        .userId(user.getId())
                        .build();

                chromaDocs.add(ChromaDocument.builder()
                        .id("chunk-" + chunk.getId())
                        .documentText(chunk.getChunkText())
                        .embedding(embedding)
                        .metadata(metadata)
                        .build());
            }

            chromaDBClient.upsertDocuments(chromaDocs);

            for (DocumentChunk chunk : persistedChunks) {
                chunk.setEmbeddingStatus(STATUS_COMPLETED);
            }
            savedMaterial.setProcessingStatus(STATUS_COMPLETED);
            StudyMaterial finalized = studyMaterialRepository.save(savedMaterial);

            log.info("Successfully processed study material [id={}, user={}, chunks={}]",
                    finalized.getId(), user.getEmail(), persistedChunks.size());

            return StudyMaterialDTO.fromEntity(finalized);

        } catch (Exception ex) {
            log.error("Failed processing PDF pipeline for file [{}]", originalFileName, ex);

            savedMaterial.setProcessingStatus(STATUS_FAILED);
            studyMaterialRepository.save(savedMaterial);

            deleteFileQuietly(storedFilePath);
            try {
                chromaDBClient.deleteByStudyMaterialId(savedMaterial.getId());
            } catch (Exception e) {
                log.warn("Failed cleaning ChromaDB vectors after error", e);
            }

            throw new StudyMaterialProcessingException("PDF processing pipeline failed: " + ex.getMessage(), ex);
        }
    }

    @Transactional(readOnly = true)
    public List<StudyMaterialDTO> getUserMaterials(User user) {
        return studyMaterialRepository.findByUserId(user.getId())
                .stream()
                .map(StudyMaterialDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyMaterialDTO getMaterialByIdAndUser(Long id, User user) {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found with id: " + id));

        verifyOwnership(material, user);
        return StudyMaterialDTO.fromEntity(material);
    }

    @Transactional(readOnly = true)
    public String getMaterialStatus(Long id, User user) {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found with id: " + id));

        verifyOwnership(material, user);
        return material.getProcessingStatus();
    }

    @Transactional
    public void deleteMaterial(Long id, User user) {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Study material not found with id: " + id));

        verifyOwnership(material, user);

        chromaDBClient.deleteByStudyMaterialId(id);
        documentChunkService.deleteChunks(id);

        if (material.getFilePath() != null) {
            deleteFileQuietly(Paths.get(material.getFilePath()));
        }

        studyMaterialRepository.delete(material);

        log.info("Deleted study material [id={}, user={}] from PostgreSQL, ChromaDB, and disk", id, user.getEmail());
    }

    private void verifyOwnership(StudyMaterial material, User user) {
        if (!material.getUser().getId().equals(user.getId())) {
            throw new StudyMaterialProcessingException("Access denied: You do not own this study material");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new StudyMaterialProcessingException("Uploaded file must not be null or empty");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new StudyMaterialProcessingException("Only PDF files are currently supported for upload");
        }
    }

    private String generateUniqueFileName(String originalFileName) {
        return UUID.randomUUID() + ".pdf";
    }

    private Path resolveStoragePath(String storedFileName) {
        try {
            Path uploadDir = Paths.get(UPLOAD_DIRECTORY).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            return uploadDir.resolve(storedFileName);
        } catch (IOException ex) {
            throw new StudyMaterialProcessingException("Failed to create file upload directory", ex);
        }
    }

    private void writeFileToDisk(MultipartFile file, Path destinationPath) {
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Saved uploaded file to [{}]", destinationPath);
        } catch (IOException ex) {
            throw new StudyMaterialProcessingException("Failed to store file on disk", ex);
        }
    }

    private void deleteFileQuietly(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.warn("Failed to clean up file at path [{}]", filePath, ex);
        }
    }
}
