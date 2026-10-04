package com.synapse.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.backend.ai.EmbeddingService;
import com.synapse.backend.ai.GeminiService;
import com.synapse.backend.chroma.ChromaDBClient;
import com.synapse.backend.chroma.ChromaQueryResult;
import com.synapse.backend.dto.ChatRequest;
import com.synapse.backend.dto.LoginRequest;
import com.synapse.backend.dto.QuizRequest;
import com.synapse.backend.dto.RegisterRequest;
import com.synapse.backend.service.PdfTextExtractorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Path;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SynapseBackendIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PdfTextExtractorService pdfTextExtractorService;

    @MockBean
    private ChromaDBClient chromaDBClient;

    @MockBean
    private EmbeddingService embeddingService;

    @MockBean
    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        when(pdfTextExtractorService.extractText(any(Path.class)))
                .thenReturn("Polymorphism allows objects of different types to respond to the same method call in Java Object Oriented Programming.\n\nInheritance allows a subclass to inherit fields and methods from a superclass.");

        when(embeddingService.generateEmbedding(anyString()))
                .thenReturn(List.of(0.1f, 0.2f, 0.3f));
        when(embeddingService.generateEmbeddings(anyList()))
                .thenAnswer(invocation -> {
                    List<String> texts = invocation.getArgument(0);
                    return texts.stream().map(t -> List.of(0.1f, 0.2f, 0.3f)).toList();
                });

        doNothing().when(chromaDBClient).upsertDocuments(anyList());
        doNothing().when(chromaDBClient).deleteByStudyMaterialId(anyLong());

        when(chromaDBClient.querySimilarity(anyList(), anyInt(), anyLong()))
                .thenReturn(List.of(
                        ChromaQueryResult.builder()
                                .id("chunk-1")
                                .documentText("Polymorphism allows objects of different types to respond to the same method call.")
                                .distance(0.1)
                                .build()
                ));

        when(geminiService.generateText(anyString()))
                .thenReturn("Polymorphism in Object-Oriented Programming allows methods to perform different tasks based on the object calling them.");
    }

    @Test
    void testEndToEndBackendFlow() throws Exception {
        String uniqueEmail = "student_" + System.currentTimeMillis() + "@synapse.edu";

        // 1. Register User A
        RegisterRequest registerReq = new RegisterRequest("Student A", uniqueEmail, "password123", "Synapse Univ", "CS", 3);
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 2. Login User A -> Get JWT Token
        LoginRequest loginReq = new LoginRequest(uniqueEmail, "password123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();
        String authHeader = "Bearer " + token;

        // 3. Upload Study Material PDF
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "oops_notes.pdf",
                "application/pdf",
                "%PDF-1.4 Mock PDF Content".getBytes()
        );

        MvcResult uploadResult = mockMvc.perform(multipart("/api/study-materials/upload")
                        .file(pdfFile)
                        .header("Authorization", authHeader))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.originalFileName").value("oops_notes.pdf"))
                .andExpect(jsonPath("$.data.id").exists())
                .andReturn();

        Long materialId = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // 4. List User Materials
        mockMvc.perform(get("/api/study-materials")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        // 5. Get Material Status
        mockMvc.perform(get("/api/study-materials/" + materialId + "/status")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // 6. Test RAG Chat Endpoint (/api/ai/chat)
        ChatRequest chatReq = new ChatRequest("What is polymorphism?");
        mockMvc.perform(post("/api/ai/chat")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(chatReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.answer").exists());

        // 7. Test Quiz Endpoint (/api/ai/quiz)
        QuizRequest quizReq = new QuizRequest("Polymorphism", 3);
        mockMvc.perform(post("/api/ai/quiz")
                        .header("Authorization", authHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(quizReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 8. Delete Study Material
        mockMvc.perform(delete("/api/study-materials/" + materialId)
                        .header("Authorization", authHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testUserIsolationSecurity() throws Exception {
        String emailUserA = "usera_" + System.currentTimeMillis() + "@synapse.edu";
        String emailUserB = "userb_" + System.currentTimeMillis() + "@synapse.edu";

        // Register & Login User A
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterRequest("User A", emailUserA, "password123", "U1", "CS", 1))));

        MvcResult loginA = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest(emailUserA, "password123")))).andReturn();
        String tokenA = objectMapper.readTree(loginA.getResponse().getContentAsString()).get("token").asText();

        // Register & Login User B
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new RegisterRequest("User B", emailUserB, "password123", "U2", "EE", 2))));

        MvcResult loginB = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest(emailUserB, "password123")))).andReturn();
        String tokenB = objectMapper.readTree(loginB.getResponse().getContentAsString()).get("token").asText();

        // User A uploads file
        MockMultipartFile fileA = new MockMultipartFile("file", "userA_secret.pdf", "application/pdf", "%PDF-1.4 Secret data".getBytes());
        MvcResult uploadA = mockMvc.perform(multipart("/api/study-materials/upload")
                        .file(fileA)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isCreated()).andReturn();

        Long idA = objectMapper.readTree(uploadA.getResponse().getContentAsString()).get("data").get("id").asLong();

        // User B attempts to access User A's file -> Expect Error (400 Bad Request / 403 Forbidden)
        mockMvc.perform(get("/api/study-materials/" + idA)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isBadRequest());

        // User B attempts to delete User A's file -> Expect Error
        mockMvc.perform(delete("/api/study-materials/" + idA)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isBadRequest());
    }
}
