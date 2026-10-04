package com.synapse.backend.config;

// Importing the Bean and Configuration annotations from Spring context
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Importing the BCrypt algorithm implementation for password hashing
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Importing the generic PasswordEncoder interface that Spring Security uses
import org.springframework.security.crypto.password.PasswordEncoder;

// @Configuration tells Spring Boot that this class provides setup instructions.
// When the application starts up, Spring will look inside this class to create specific components (Beans).
@Configuration
public class PasswordConfig {

    // @Bean tells Spring to execute this method and keep the returned object in its "Application Context" (memory).
    // Now, whenever a class (like our UserService) needs a PasswordEncoder, Spring will automatically inject this exact object.
    @Bean
    public PasswordEncoder passwordEncoder() {

        // BCryptPasswordEncoder is a strong, industry-standard hashing algorithm.
        // It automatically generates a unique "salt" (random data) for every password.
        // This means even if two users have the exact same password, their encrypted passwords in the database will look completely different!
        return new BCryptPasswordEncoder();
    }
}