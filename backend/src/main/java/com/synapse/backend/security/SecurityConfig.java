package com.synapse.backend.security;

import com.synapse.backend.jwt.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final List<String> DEFAULT_ORIGINS = List.of(
            "https://synapse-academic.vercel.app", "https://synapse-mgph.vercel.app", "http://localhost:5173");

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String allowedOriginsStr;
    private final String allowedOriginRegexStr;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${cors.allowed-origins:}") String allowedOriginsStr,
            @Value("${cors.allowed-origin-regex:}") String allowedOriginRegexStr) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOriginsStr = allowedOriginsStr;
        this.allowedOriginRegexStr = allowedOriginRegexStr;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health/**").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"Please sign in to continue.\"}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"You do not have permission to perform this action.\"}");
                        }))
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = splitList(allowedOriginsStr).stream()
                .filter(s -> !s.contains("*"))
                .collect(Collectors.toList());
        if (origins.isEmpty()) {
            origins = DEFAULT_ORIGINS;
        }

        // Full-match regexes for extra origins, e.g. this project's Vercel preview deployments.
        // Wildcards are deliberately not supported in the exact-origin list above.
        List<Pattern> originPatterns = splitList(allowedOriginRegexStr).stream()
                .map(Pattern::compile)
                .collect(Collectors.toList());

        CorsConfiguration configuration = new CorsConfiguration() {
            @Override
            public String checkOrigin(String requestOrigin) {
                String allowed = super.checkOrigin(requestOrigin);
                if (allowed != null || requestOrigin == null) {
                    return allowed;
                }
                String origin = requestOrigin.trim().toLowerCase(Locale.ROOT);
                return originPatterns.stream().anyMatch(p -> p.matcher(origin).matches()) ? requestOrigin : null;
            }
        };
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        // Auth uses a bearer token header, not cookies, so credentialed CORS is not needed
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static List<String> splitList(String value) {
        if (value == null) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
