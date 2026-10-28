package com.synapse.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synapse.backend.chroma.ChromaDBClient;
import com.synapse.backend.dto.LoginRequest;
import com.synapse.backend.dto.RegisterRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthAndCorsHardeningTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChromaDBClient chromaDBClient;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private void preflight(String origin, boolean allowed) throws Exception {
        var result = mockMvc.perform(options("/api/auth/register")
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type"));
        if (allowed) {
            result.andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin))
                    .andExpect(header().doesNotExist("Access-Control-Allow-Credentials"));
        } else {
            result.andExpect(status().isForbidden())
                    .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
        }
    }

    @Test
    void corsAllowsProjectOriginsAndPreviewsOnly() throws Exception {
        preflight("https://synapse-academic.vercel.app", true);
        preflight("https://synapse-mgph.vercel.app", true);
        preflight("http://localhost:5173", true);
        // The preview deployment from the original "Failed to fetch" report
        preflight("https://synapse-mgph-q6iawco0x-sairamoffical07.vercel.app", true);
        preflight("https://synapse-ab12cd34e-sairamoffical07.vercel.app", true);

        preflight("https://evil.vercel.app", false);
        preflight("https://synapse-mgph-q6iawco0x-someoneelse.vercel.app", false);
        preflight("https://synapse-x.evil-sairamoffical07.vercel.app", false);
        preflight("https://synapse-mgph-q6iawco0x-sairamoffical07xvercel.app", false);
        preflight("http://synapse-mgph-q6iawco0x-sairamoffical07.vercel.app", false);
    }

    private void register(String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Test User", email, password, "Uni", "CS", 1))))
                .andExpect(status().isOk());
    }

    private String login(String email, String password) throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("token").asText();
    }

    @Test
    void registrationNormalizesEmailAndRejectsDuplicates() throws Exception {
        register("  Mixed.Case@Example.com ", "password123");

        // Same address in different case is a duplicate
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterRequest("Other", "mixed.case@example.com", "password123", null, null, 1))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("That email is already registered."));

        String token = login("MIXED.case@example.COM", "password123");
        mockMvc.perform(get("/api/study-materials").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("mixed.case@example.com", "wrong-password"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }

    @Test
    void expiredOrphanedAndForeignTokensReturn401() throws Exception {
        var key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        String expired = Jwts.builder().subject("someone@example.com")
                .issuedAt(new Date(System.currentTimeMillis() - 7_200_000))
                .expiration(new Date(System.currentTimeMillis() - 3_600_000))
                .signWith(key).compact();
        mockMvc.perform(get("/api/study-materials").header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Your session has expired. Please sign in again."));

        // Validly signed token for an account that no longer exists (e.g. after a database reset)
        String orphan = Jwts.builder().subject("deleted-user@example.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(key).compact();
        mockMvc.perform(get("/api/study-materials").header("Authorization", "Bearer " + orphan))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Your account could not be found. Please sign in again."));

        // A token signed with the previously hard-coded public secret must no longer be accepted
        var oldPublicKey = Keys.hmacShaKeyFor("synapse-super-secret-key-for-jwt-token-generation-2026".getBytes(StandardCharsets.UTF_8));
        String forged = Jwts.builder().subject("someone@example.com")
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(oldPublicKey).compact();
        mockMvc.perform(get("/api/study-materials").header("Authorization", "Bearer " + forged))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/study-materials").header("Authorization", "Token abc"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void malformedRequestsGetSafeErrors() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{bad"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The request body is missing or malformed."));

        register("uploader@example.com", "password123");
        String token = login("uploader@example.com", "password123");

        MockMultipartFile fake = new MockMultipartFile("file", "notes.pdf", "application/pdf", "<html>not a pdf</html>".getBytes());
        mockMvc.perform(multipart("/api/study-materials/upload").file(fake).header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This file is not a valid PDF."));

        mockMvc.perform(multipart("/api/study-materials/upload").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(get("/api/study-materials/999999").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
