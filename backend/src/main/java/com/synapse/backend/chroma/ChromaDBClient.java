package com.synapse.backend.chroma;

import com.synapse.backend.exception.ChromaDBException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ChromaDBClient {

    private static final Logger log = LoggerFactory.getLogger(ChromaDBClient.class);

    private final ChromaDBProperties chromaDBProperties;
    private final RestTemplate restTemplate;
    private String cachedCollectionId;

    public ChromaDBClient(ChromaDBProperties chromaDBProperties, RestTemplate restTemplate) {
        this.chromaDBProperties = chromaDBProperties;
        this.restTemplate = restTemplate;
    }

    private String getBaseUrl() {
        String host = chromaDBProperties.getHost();
        if (host.endsWith("/")) {
            host = host.substring(0, host.length() - 1);
        }
        return host + "/api/v1";
    }

    public synchronized String getOrCreateCollection() {
        if (cachedCollectionId != null) {
            return cachedCollectionId;
        }

        String collectionName = chromaDBProperties.getCollection();
        String url = getBaseUrl() + "/collections";

        try {
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            if (response.getBody() != null) {
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        Map collectionMap = (Map) item;
                        if (collectionName.equals(collectionMap.get("name"))) {
                            cachedCollectionId = (String) collectionMap.get("id");
                            log.info("Found existing ChromaDB collection [{}] with id [{}]", collectionName, cachedCollectionId);
                            return cachedCollectionId;
                        }
                    }
                }
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", collectionName);
            requestBody.put("metadata", Map.of("description", "Synapse Academic Study Materials Vectors"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> createResponse = restTemplate.postForEntity(url, entity, Map.class);
            if (createResponse.getBody() != null && createResponse.getBody().containsKey("id")) {
                cachedCollectionId = (String) createResponse.getBody().get("id");
                log.info("Created new ChromaDB collection [{}] with id [{}]", collectionName, cachedCollectionId);
                return cachedCollectionId;
            }

            throw new ChromaDBException("Failed to obtain collection ID from response");

        } catch (Exception e) {
            log.error("Failed to initialize ChromaDB collection [{}]", collectionName, e);
            throw new ChromaDBException("ChromaDB connection/initialization error: " + e.getMessage(), e);
        }
    }

    public void upsertDocuments(List<ChromaDocument> documents) {
        if (documents == null || documents.isEmpty()) {
            return;
        }

        String collectionId = getOrCreateCollection();
        String url = getBaseUrl() + "/collections/" + collectionId + "/upsert";

        List<String> ids = new ArrayList<>();
        List<List<Float>> embeddings = new ArrayList<>();
        List<Map<String, Object>> metadatas = new ArrayList<>();
        List<String> docTexts = new ArrayList<>();

        for (ChromaDocument doc : documents) {
            ids.add(doc.getId());
            embeddings.add(doc.getEmbedding());
            metadatas.add(doc.getMetadata() != null ? doc.getMetadata().toMap() : Collections.emptyMap());
            docTexts.add(doc.getDocumentText() != null ? doc.getDocumentText() : "");
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("ids", ids);
        requestBody.put("embeddings", embeddings);
        requestBody.put("metadatas", metadatas);
        requestBody.put("documents", docTexts);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(url, entity, Map.class);
            log.info("Successfully upserted {} vectors into ChromaDB collection [{}]", documents.size(), chromaDBProperties.getCollection());

        } catch (Exception e) {
            log.error("Failed to upsert documents into ChromaDB", e);
            throw new ChromaDBException("Failed to store vector embeddings in ChromaDB: " + e.getMessage(), e);
        }
    }

    public List<ChromaQueryResult> querySimilarity(List<Float> queryEmbedding, int nResults, Long userId) {
        String collectionId = getOrCreateCollection();
        String url = getBaseUrl() + "/collections/" + collectionId + "/query";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query_embeddings", List.of(queryEmbedding));
        requestBody.put("n_results", nResults);

        if (userId != null) {
            requestBody.put("where", Map.of("userId", userId));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = responseEntity.getBody();

            List<ChromaQueryResult> results = new ArrayList<>();
            if (responseBody != null) {
                List<List<String>> idsList = (List<List<String>>) responseBody.get("ids");
                List<List<String>> documentsList = (List<List<String>>) responseBody.get("documents");
                List<List<Map<String, Object>>> metadatasList = (List<List<Map<String, Object>>>) responseBody.get("metadatas");
                List<List<Number>> distancesList = (List<List<Number>>) responseBody.get("distances");

                if (idsList != null && !idsList.isEmpty() && !idsList.get(0).isEmpty()) {
                    List<String> ids = idsList.get(0);
                    List<String> docs = documentsList != null && !documentsList.isEmpty() ? documentsList.get(0) : Collections.emptyList();
                    List<Map<String, Object>> metas = metadatasList != null && !metadatasList.isEmpty() ? metadatasList.get(0) : Collections.emptyList();
                    List<Number> dists = distancesList != null && !distancesList.isEmpty() ? distancesList.get(0) : Collections.emptyList();

                    for (int i = 0; i < ids.size(); i++) {
                        String id = ids.get(i);
                        String doc = i < docs.size() ? docs.get(i) : "";
                        Map<String, Object> meta = i < metas.size() ? metas.get(i) : Collections.emptyMap();
                        Double dist = i < dists.size() ? dists.get(i).doubleValue() : null;

                        results.add(ChromaQueryResult.builder()
                                .id(id)
                                .documentText(doc)
                                .metadata(ChromaDocumentMetadata.fromMap(meta))
                                .distance(dist)
                                .build());
                    }
                }
            }

            log.info("ChromaDB query retrieved {} matching chunks for userId={}", results.size(), userId);
            return results;

        } catch (Exception e) {
            log.error("Failed to query ChromaDB", e);
            throw new ChromaDBException("ChromaDB vector query failed: " + e.getMessage(), e);
        }
    }

    public void deleteByStudyMaterialId(Long studyMaterialId) {
        if (studyMaterialId == null) return;

        String collectionId = getOrCreateCollection();
        String url = getBaseUrl() + "/collections/" + collectionId + "/delete";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("where", Map.of("studyMaterialId", studyMaterialId));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(url, entity, Map.class);
            log.info("Deleted vectors from ChromaDB for studyMaterialId={}", studyMaterialId);

        } catch (Exception e) {
            log.error("Failed to delete vectors from ChromaDB for studyMaterialId={}", studyMaterialId, e);
            throw new ChromaDBException("Failed to delete vectors from ChromaDB: " + e.getMessage(), e);
        }
    }
}
