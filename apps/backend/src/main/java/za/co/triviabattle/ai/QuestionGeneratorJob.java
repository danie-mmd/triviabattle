package za.co.triviabattle.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * QuestionGeneratorJob
 *
 * Calls the Gemini API daily to generate 10 trivia questions based on
 * trending news in South Africa and globally.
 *
 * Also exposes POST /api/ai/generate-questions for manual triggering
 * (e.g. via Cloud Scheduler HTTP target or during development).
 *
 * Persists generated questions to MySQL via the questions table.
 */
@Slf4j
@Component
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class QuestionGeneratorJob {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final za.co.triviabattle.game.repository.QuestionRepository questionRepository;

    // Scheduled at 06:00 SAST (04:00 UTC) every day
    @Scheduled(cron = "0 0 4 * * *", zone = "UTC")
    public void scheduledGeneration() {
        log.info("[AI] Starting scheduled daily question generation");
        generateAndSave().subscribe(
                count -> log.info("[AI] Generated {} questions", count),
                err   -> log.error("[AI] Question generation failed", err)
        );
    }

    @PostMapping("/generate-questions")
    public Mono<Map<String, Object>> manualTrigger() {
        return generateAndSave()
                .map(count -> Map.of("generated", count, "date", LocalDate.now().toString()));
    }

    // ── Core generation logic ─────────────────────────────────────────────────

    private Mono<Integer> generateAndSave() {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            log.warn("[AI] GEMINI_API_KEY is not set – skipping generation");
            return Mono.just(0);
        }

        log.info("[AI] Using Gemini API Key (length: {}, ends with: ...{})", 
            geminiApiKey.length(), 
            geminiApiKey.length() > 4 ? geminiApiKey.substring(geminiApiKey.length() - 4) : "****");

        String prompt = buildPrompt();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        return webClientBuilder.build()
                .post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                        geminiModel, geminiApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.isError(), response -> {
                    return response.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                log.error("[AI] Gemini API Error: {} - {}", response.statusCode(), errorBody);
                                return Mono.error(new RuntimeException("Gemini API Error: " + response.statusCode()));
                            });
                })
                .bodyToMono(Map.class)
                .flatMap(response -> parseAndPersist(response))
                .onErrorResume(e -> {
                    log.error("[AI] Question generation process failed: {}", e instanceof Throwable t ? t.getMessage() : e);
                    return Mono.just(0);
                });
    }

    @SuppressWarnings("unchecked")
    private Mono<Integer> parseAndPersist(Map<String, Object> response) {
        return Mono.fromCallable(() -> {
            try {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates == null || candidates.isEmpty()) return 0;

                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                String rawJson = (String) parts.get(0).get("text");

                rawJson = rawJson.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

                List<Map<String, Object>> jsonQuestions = objectMapper.readValue(
                        rawJson,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
                );

                int savedCount = 0;
                for (Map<String, Object> jq : jsonQuestions) {
                    try {
                        String text = (String) jq.get("question");
                        String hash = generateHash(text);
                        
                        // Check for duplicate
                        if (questionRepository.existsByContentHash(hash)) continue;

                        List<String> opts = (List<String>) jq.get("options");
                        za.co.triviabattle.game.model.Question q = za.co.triviabattle.game.model.Question.builder()
                                .questionText(text)
                                .optionA(opts.get(0))
                                .optionB(opts.get(1))
                                .optionC(opts.get(2))
                                .optionD(opts.get(3))
                                .correctIndex(((Number) jq.get("correctIndex")).byteValue())
                                .category((String) jq.get("category"))
                                .difficulty(za.co.triviabattle.game.model.Question.Difficulty.valueOf(((String) jq.get("difficulty")).toLowerCase()))
                                .region(za.co.triviabattle.game.model.Question.Region.valueOf(((String) jq.get("region")).toLowerCase()))
                                .contentHash(hash)
                                .active(true)
                                .build();

                        questionRepository.save(q);
                        savedCount++;
                    } catch (Exception ex) {
                        log.error("[AI] Error saving question: {}", jq, ex);
                    }
                }
                return savedCount;
            } catch (Exception e) {
                log.error("[AI] Failed to parse Gemini response", e);
                return 0;
            }
        });
    }

    private String generateHash(String input) throws java.security.NoSuchAlgorithmException {
        java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private String buildPrompt() {
        return """
                You are a professional trivia question generator. Today is %s.
                
                TASK:
                Generate exactly 10 SHORT, PUNCHY trivia questions.
                Provide a mix of:
                - 50%% CURRENT trending news and events (South Africa & Global).
                - 50%% EVERGREEN general knowledge (History, Geography, Science, Movies, etc.).
                
                DIFFICULTY MIX:
                - 4 Easy questions
                - 4 Medium questions
                - 2 Hard questions
                
                STYLE RULES:
                - BREVITY IS KEY: Questions must be short and direct (MAX 100 characters).
                - NO FILLER: Avoid introductory clauses like "To combat the challenge of..." or "In a surprising move...".
                - GET STRAIGHT TO THE POINT: e.g., "Which organ produces insulin?" instead of a long medical explanation.
                - Focus on: politics, sport, technology, movies, entertainment, science.
                
                JSON FORMAT (Return ONLY the array):
                [
                  {
                    "question": "What...",
                    "options": ["A", "B", "C", "D"],
                    "correctIndex": 0,
                    "category": "Topic",
                    "difficulty": "easy/medium/hard",
                    "region": "south_africa/global"
                  }
                ]
                
                RULES:
                - Options must be concise (max 3-5 words each).
                - Difficulty must exactly match the requested mix.
                - Region must be "south_africa" (5 questions) or "global" (5 questions).
                """.formatted(LocalDate.now());
    }
}
