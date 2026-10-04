package com.synapse.backend.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service responsible for splitting large blocks of extracted PDF text into
 * smaller, semantically coherent chunks suitable for downstream AI processing
 * (e.g. embedding generation, vector storage, or LLM context windows).
 *
 * <p>The chunking strategy aims to:
 * <ul>
 *     <li>Produce chunks within a configurable target size window
 *         (default 800–1000 characters).</li>
 *     <li>Avoid splitting words in the middle.</li>
 *     <li>Preserve paragraph boundaries whenever possible.</li>
 *     <li>Discard empty or whitespace-only chunks.</li>
 * </ul>
 *
 * <p>Chunk size bounds are externalized via {@code application.properties}
 * so they can be tuned without recompiling:
 * <pre>{@code
 * ai.chunk.min-size=800
 * ai.chunk.max-size=1000
 * }</pre>
 *
 * <p>This class is stateless (aside from injected configuration) and
 * thread-safe; a single instance can be shared across the application context.
 */
@Service
public class TextChunkingService {

    /** Delimiter used to detect paragraph boundaries in the source text. */
    private static final String PARAGRAPH_DELIMITER = "\n\n";

    /** Lower bound (in characters) of the target chunk size window. */
    private final int minChunkSize;

    /** Upper bound (in characters) of the target chunk size window. */
    private final int maxChunkSize;

    /**
     * Creates the service with configurable chunk size bounds.
     *
     * @param minChunkSize minimum target chunk size, in characters
     *                     (property: {@code ai.chunk.min-size}, default 800)
     * @param maxChunkSize maximum target chunk size, in characters
     *                     (property: {@code ai.chunk.max-size}, default 1000)
     */
    public TextChunkingService(
            @Value("${ai.chunk.min-size:800}") int minChunkSize,
            @Value("${ai.chunk.max-size:1000}") int maxChunkSize) {
        if (minChunkSize <= 0 || maxChunkSize <= 0 || minChunkSize > maxChunkSize) {
            throw new IllegalArgumentException(
                    "Invalid chunk size configuration: min=%d, max=%d"
                            .formatted(minChunkSize, maxChunkSize));
        }
        this.minChunkSize = minChunkSize;
        this.maxChunkSize = maxChunkSize;
    }

    /**
     * Splits the given raw text (typically extracted from a PDF) into a list
     * of trimmed, non-empty chunks within the configured target size window.
     *
     * <p>The algorithm first splits the text into paragraphs. Paragraphs are
     * then greedily accumulated into a chunk buffer until adding the next
     * paragraph would exceed the configured maximum, at which point the
     * buffer is flushed as a chunk. Paragraphs larger than the configured
     * maximum are further split on word boundaries so that no word is ever
     * broken across two chunks.
     *
     * @param text the raw extracted text to split; may be {@code null} or blank
     * @return a {@link List} of non-empty, trimmed text chunks;
     *         an empty list if the input is {@code null} or blank
     */
    public List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return chunks;
        }

        String normalized = text.replace("\r\n", "\n").replace("\r", "\n");
        String[] paragraphs = normalized.split(PARAGRAPH_DELIMITER);

        StringBuilder buffer = new StringBuilder();

        for (String rawParagraph : paragraphs) {
            String paragraph = rawParagraph.trim();
            if (paragraph.isEmpty()) {
                continue;
            }

            if (paragraph.length() > maxChunkSize) {
                flushBuffer(buffer, chunks);
                splitOversizedParagraph(paragraph, chunks);
                continue;
            }

            if (buffer.isEmpty()) {
                buffer.append(paragraph);
            } else if (buffer.length() + PARAGRAPH_DELIMITER.length() + paragraph.length() <= maxChunkSize) {
                buffer.append(PARAGRAPH_DELIMITER).append(paragraph);
            } else {
                flushBuffer(buffer, chunks);
                buffer.append(paragraph);
            }

            if (buffer.length() >= minChunkSize) {
                flushBuffer(buffer, chunks);
            }
        }

        flushBuffer(buffer, chunks);

        return chunks;
    }

    /**
     * Flushes the contents of the given buffer into the chunk list as a
     * trimmed, non-empty chunk, then clears the buffer.
     *
     * @param buffer the mutable chunk buffer to flush
     * @param chunks the destination list to append the flushed chunk to
     */
    private void flushBuffer(StringBuilder buffer, List<String> chunks) {
        String candidate = buffer.toString().trim();
        if (!candidate.isEmpty()) {
            chunks.add(candidate);
        }
        buffer.setLength(0);
    }

    /**
     * Splits a single paragraph that exceeds the configured maximum chunk
     * size into multiple chunks, breaking only on whitespace so that no word
     * is split in half.
     *
     * @param paragraph the oversized paragraph to split
     * @param chunks    the destination list to append the resulting chunks to
     */
    private void splitOversizedParagraph(String paragraph, List<String> chunks) {
        String[] words = paragraph.split("\\s+");
        StringBuilder buffer = new StringBuilder();

        for (String word : words) {
            if (word.isEmpty()) {
                continue;
            }

            int projectedLength = buffer.isEmpty()
                    ? word.length()
                    : buffer.length() + 1 + word.length();

            if (projectedLength > maxChunkSize && !buffer.isEmpty()) {
                flushBuffer(buffer, chunks);
            }

            if (buffer.isEmpty()) {
                buffer.append(word);
            } else {
                buffer.append(' ').append(word);
            }

            if (buffer.length() >= minChunkSize) {
                flushBuffer(buffer, chunks);
            }
        }

        flushBuffer(buffer, chunks);
    }
}