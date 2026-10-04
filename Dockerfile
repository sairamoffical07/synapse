# Stage 1: Build Spring Boot Backend from monorepo root
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY backend/.mvn/ backend/.mvn/
COPY backend/mvnw backend/pom.xml ./backend/
WORKDIR /app/backend
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B || true

COPY backend/src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Production JRE image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/backend/target/*.jar app.jar

ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
