package com.synapse.backend.file;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {

    // Get all files uploaded by a specific user
    List<StudyMaterial> findByUserId(Long userId);

}