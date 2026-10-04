package com.synapse.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("status", "Synapse Backend is Running \uD83D\uDE80");
        responseData.put("project", "Synapse");
        responseData.put("version", "1.0.0");
        responseData.put("timestamp", Instant.now());

        return ResponseEntity.ok(responseData);
    }
}