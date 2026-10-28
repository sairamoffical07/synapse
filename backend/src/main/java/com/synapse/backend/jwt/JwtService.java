package com.synapse.backend.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Date;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    // HS256 needs at least 256 bits of key material
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.expiration-hours:24}") long expirationHours) {
        this.signingKey = buildSigningKey(secret);
        this.expirationMillis = expirationHours * 60 * 60 * 1000;
    }

    // The signing secret comes from JWT_SECRET. Without one, a random per-process key is used,
    // so tokens stay unforgeable but every restart signs everyone out.
    private static SecretKey buildSigningKey(String secret) {
        byte[] bytes = secret == null ? new byte[0] : secret.trim().getBytes(StandardCharsets.UTF_8);
        if (bytes.length >= MIN_SECRET_BYTES) {
            return Keys.hmacShaKeyFor(bytes);
        }
        if (bytes.length > 0) {
            log.warn("JWT_SECRET is shorter than {} bytes; using a random per-process signing key instead", MIN_SECRET_BYTES);
        } else {
            log.warn("JWT_SECRET is not set; using a random per-process signing key (sessions end on restart)");
        }
        byte[] random = new byte[64];
        new SecureRandom().nextBytes(random);
        return Keys.hmacShaKeyFor(random);
    }

    // Generate JWT token
    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract email from token; throws ExpiredJwtException / JwtException for expired or tampered tokens
    public String extractEmail(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // Validate token
    public boolean isTokenValid(String token, String email) {
        return java.util.Objects.equals(extractEmail(token), email);
    }
}
