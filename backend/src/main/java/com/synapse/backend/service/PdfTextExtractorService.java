package com.synapse.backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class PdfTextExtractorService {

    /**
     * Extracts all text from a PDF file.
     *
     * @param pdfFile The uploaded PDF file.
     * @return Extracted text.
     */
    public String extractText(File pdfFile) {
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from PDF file: " + pdfFile.getName(), e);
        }
    }

    /**
     * Extracts all text from a PDF given its Path.
     *
     * @param pdfPath Path to the PDF file.
     * @return Extracted text.
     */
    public String extractText(Path pdfPath) {
        return extractText(pdfPath.toFile());
    }
}