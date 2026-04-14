# ─────────────────────────────────────────────────────────────────
# TriviaBattle Backend – Docker Image
#
# Multi-stage build:
#  Stage 1 (builder): Maven + JDK 21 → produces the fat JAR
#  Stage 2 (runtime): JRE 21 slim    → smallest production image
#
# Designed for GCP Cloud Run:
#  - Listens on $PORT (Cloud Run injects this, default 8080)
#  - All secrets injected via environment variables (not baked in)
# ─────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Cache Maven dependencies before copying source
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build (skip tests; run them in CI)
COPY src/ src/
RUN ./mvnw package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copy the fat JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose the default port (Cloud Run will override with $PORT)
EXPOSE 8080

# JVM flags tuned for containerised environments:
#   -XX:+UseContainerSupport     → respects cgroup CPU/memory limits
#   -XX:MaxRAMPercentage=75      → leave headroom for the JVM overhead
#   -XX:+OptimizeStringConcat    → minor startup perf
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
  "-jar", "app.jar"]
