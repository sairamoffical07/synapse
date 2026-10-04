package com.synapse.backend.file;

import com.synapse.backend.dto.ApiResponse;
import com.synapse.backend.dto.StudyMaterialDTO;
import com.synapse.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study-materials")
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    public StudyMaterialController(StudyMaterialService studyMaterialService) {
        this.studyMaterialService = studyMaterialService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<StudyMaterialDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        StudyMaterialDTO material = studyMaterialService.uploadPDF(file, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Study material uploaded and processed successfully", material));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyMaterialDTO>>> getUserMaterials(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<StudyMaterialDTO> materials = studyMaterialService.getUserMaterials(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("User study materials retrieved", materials));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyMaterialDTO>> getMaterialById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        StudyMaterialDTO material = studyMaterialService.getMaterialByIdAndUser(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Study material retrieved", material));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, String>>> getMaterialStatus(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        String status = studyMaterialService.getMaterialStatus(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Status retrieved", Map.of("status", status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        studyMaterialService.deleteMaterial(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Study material and vector embeddings deleted successfully"));
    }
}