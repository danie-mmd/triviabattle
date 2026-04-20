package za.co.triviabattle.game.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import za.co.triviabattle.auth.JwtService;
import za.co.triviabattle.game.model.*;
import za.co.triviabattle.game.repository.*;
import za.co.triviabattle.game.service.*;
import za.co.triviabattle.users.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * GameWebSocketHandler
 *
 * Manages per-room broadcast sinks. Each room has one Sinks.Many<String>
 * that fans out messages to all connected sessions.
 *
 * Incoming message types:
 *   JOIN_ROOM     – player registers; starts game if all joined
 *   SUBMIT_ANSWER – { optionIndex, timestamp }
 *   USE_POWERUP   – { powerUpType }
 *   SABOTAGE      – forwarded to target players
 *
 * Outgoing message types:
 *   GAME_STATE    – { state }
 *   QUESTION      – { id, text, options, timeLimit }
 *   SCORE_UPDATE  – { userId, score }
 *   PLAYERS       – { players: [{userId, firstName}] }
 *   SABOTAGE_EVENT – { sabotageType }
 *   GAME_OVER     – { scores, winnerId }
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GameWebSocketHandler implements WebSocketHandler {

    /** roomId → broadcast sink (multicast, all subscribers receive every message) */
    private static final Map<String, Sinks.Many<String>> ROOM_SINKS = new ConcurrentHashMap<>();

    /** sessionId → roomId (for cleanup on disconnect) */
    private static final Map<String, String> SESSION_ROOMS = new ConcurrentHashMap<>();

    private final RoomService roomService;
    private final ScoringService scoringService;
    private final QuestionRepository questionRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final AnswerLogRepository answerLogRepository;
    private final UserRepository userRepository;

    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private GameService gameService;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String roomId = extractQueryParam(session.getHandshakeInfo().getUri().getQuery(), "roomId");
        String token  = extractQueryParam(session.getHandshakeInfo().getUri().getQuery(), "token");

        if (roomId == null) {
            log.warn("[WS] Missing roomId, closing session {}", session.getId());
            return session.close();
        }

        // Verify token
        String userId = jwtService.validateToken(token)
                .map(jwtService::getUserId)
                .orElse(null);

        if (userId == null) {
            log.warn("[WS] Invalid token, closing session {}", session.getId());
            return session.close();
        }

        // Register session → room mapping
        SESSION_ROOMS.put(session.getId(), roomId);

        // Get or create the multicast sink for this room
        Sinks.Many<String> roomSink = ROOM_SINKS.computeIfAbsent(roomId,
                k -> Sinks.many().multicast().directBestEffort());

        // Create a session-specific sink for direct messages (initial sync)
        Sinks.Many<String> sessionSink = Sinks.many().replay().latest();

        // ── Outbound: merge room sink and session sink ────────────────────────
        Flux<WebSocketMessage> outbound = Flux.merge(roomSink.asFlux(), sessionSink.asFlux())
                .map(session::textMessage);

        // ── Inbound: handle player messages ───────────────────────────────────
        final String finalUserId = userId;
        Mono<Void> inbound = session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .flatMap(payload -> handleMessage(session, roomId, finalUserId, payload, roomSink, sessionSink))
                .then();

        return session.send(outbound)
                .and(inbound)
                .doFinally(signalType -> {
                    log.info("[WS] Session {} closed ({})", session.getId(), signalType);
                    SESSION_ROOMS.remove(session.getId());
                });
    }

    // ── Message routing ───────────────────────────────────────────────────────

    private Mono<Void> handleMessage(WebSocketSession session, String roomId, String userId,
                                     String payload, Sinks.Many<String> roomSink, Sinks.Many<String> sessionSink) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> msg = objectMapper.readValue(payload, Map.class);
            String type = (String) msg.get("type");

            return switch (type) {
                case "JOIN_ROOM"     -> handleJoin(session, roomId, userId, msg, roomSink, sessionSink);
                case "CONFIRM_DEPOSIT" -> handleConfirmDeposit(roomId, userId);
                case "SUBMIT_ANSWER" -> handleAnswer(roomId, userId, msg, roomSink);
                case "USE_POWERUP"   -> handlePowerUp(roomId, userId, msg, roomSink);
                default -> {
                    log.debug("[WS] Unknown message type: {}", type);
                    yield Mono.empty();
                }
            };
        } catch (Exception e) {
            log.error("[WS] Failed to parse message: {}", payload, e);
            return Mono.empty();
        }
    }

    private Mono<Void> handleJoin(WebSocketSession session, String roomId, String userId, 
                                  Map<String, Object> msg, Sinks.Many<String> roomSink, Sinks.Many<String> sessionSink) {
        return roomService.getRoom(roomId)
                .switchIfEmpty(Mono.error(new RuntimeException("ROOM_NOT_FOUND")))
                .flatMap(room -> {
                    // 1. Notify everyone about the new player (via roomSink)
                    List<Map<String, String>> playerList = room.getPlayerIds().stream()
                            .map(uid -> Map.of(
                                    "userId", uid,
                                    "firstName", room.getPlayerNames().getOrDefault(uid, uid)))
                            .toList();

                    broadcast(roomSink, Map.of(
                            "type", "PLAYERS",
                            "players", playerList
                    ));
                    
                    log.info("[WS] Syncing state to session for user {} in room {}: state={}, questions={}", 
                            userId, roomId, room.getState(), room.getQuestionIds().size());

                    boolean depositConfirmed = room.getDepositsConfirmed().getOrDefault(userId, false);
                    return Mono.fromCallable(() -> userRepository.findById(Long.valueOf(userId)))
                            .flatMap(optUser -> {
                                int stars = optUser.map(u -> u.getStarsBalance()).orElse(0);
                                // 2. Send specific state info to the NEW session (via sessionSink)
                                broadcast(sessionSink, Map.of(
                                        "type", "GAME_STATE", 
                                        "state", room.getState(),
                                        "depositConfirmed", depositConfirmed,
                                        "starsBalance", stars,
                                        "powerUpUsedThisGame", room.getPowerUpsUsedThisGame().contains(userId),
                                        "players", playerList
                                ));
            
                                if (room.getState() == GameState.QUESTION_ACTIVE && room.getCurrentQuestionIndex() < room.getQuestionIds().size()) {
                                    Long qid = room.getQuestionIds().get(room.getCurrentQuestionIndex());
                                    return Mono.fromCallable(() -> questionRepository.findById(qid))
                                            .flatMap(qOpt -> Mono.justOrEmpty(qOpt))
                                            .doOnNext(question -> {
                                                broadcast(sessionSink, Map.of(
                                                        "type", "QUESTION",
                                                        "question", Map.of(
                                                            "id", question.getId(),
                                                            "text", question.getQuestionText(),
                                                            "options", List.of(question.getOptionA(), question.getOptionB(), question.getOptionC(), question.getOptionD()),
                                                            "timeLimit", 20,
                                                            "index", room.getCurrentQuestionIndex() + 1,
                                                            "total", room.getQuestionIds().size()
                                                        )
                                                ));
                                            }).then();
                                }
                                return Mono.empty();
                            });
                })
                .onErrorResume(e -> {
                    if ("ROOM_NOT_FOUND".equals(e.getMessage())) {
                        log.info("[WS] Room {} not found on JOIN_ROOM, assuming GAME_OVER for user {}", roomId, userId);
                        broadcast(sessionSink, Map.of("type", "GAME_OVER"));
                        return Mono.empty();
                    }
                    log.error("[WS] Error in handleJoin for room {}", roomId, e);
                    return Mono.empty();
                });
    }

    private Mono<Void> handleConfirmDeposit(String roomId, String userId) {
        return roomService.getRoom(roomId)
                .flatMap(room -> {
                    if (room.getState() != GameState.DEPOSIT_PHASE) {
                        return Mono.empty();
                    }
                    room.getDepositsConfirmed().put(userId, true);
                    
                    // Check if all players confirmed
                    boolean allConfirmed = room.getPlayerIds().stream()
                            .allMatch(id -> room.getDepositsConfirmed().getOrDefault(id, false));

                    if (allConfirmed) {
                        log.info("[WS] All deposits confirmed for room {}. Starting match.", roomId);
                        return roomService.saveRoom(room)
                                .then(gameService.startMatch(room));
                    } else {
                        return roomService.saveRoom(room).then();
                    }
                });
    }


    private Mono<Void> handleAnswer(String roomId, String userId, Map<String, Object> msg, Sinks.Many<String> sink) {
        int optionIndex = (int) msg.get("optionIndex");
        long clientTimestamp = ((Number) msg.getOrDefault("timestamp", System.currentTimeMillis())).longValue();

        return roomService.getRoom(roomId)
                .flatMap(room -> {
                    if (room.getAnsweredThisRound().getOrDefault(userId, false)) {
                        return Mono.empty(); // duplicate submission guard
                    }

                    Long questionId = room.getQuestionIds().get(room.getCurrentQuestionIndex());
                    return Mono.fromCallable(() -> questionRepository.findById(questionId))
                        .flatMap(opt -> Mono.justOrEmpty(opt))
                        .flatMap(question -> {
                            boolean isCorrect = (optionIndex == question.getCorrectIndex());
                            int basePoints = scoringService.calculatePoints(
                                room.getQuestionStartedAt(), clientTimestamp, isCorrect);
                            
                            // Apply 2× multiplier if player activated DOUBLE_POINTS this round
                            boolean doubled = room.getDoublePointsActive().contains(userId);
                            int points = doubled ? basePoints * 2 : basePoints;
                            if (doubled) {
                                log.info("[WS] DOUBLE_POINTS activated for {}: {} → {}", userId, basePoints, points);
                                room.getDoublePointsActive().remove(userId);
                            }
                            
                            int newScore = scoringService.applyScore(
                                room.getScores().getOrDefault(userId, 0), points);

                            room.getScores().put(userId, newScore);
                            room.getAnsweredThisRound().put(userId, true);

                            // Save to AnswerLog
                            if (room.getDatabaseTournamentId() != null) {
                                AnswerLog logEntry = AnswerLog.builder()
                                        .tournamentId(room.getDatabaseTournamentId())
                                        .userId(Long.valueOf(userId))
                                        .questionId(questionId)
                                        .selectedIndex((byte)optionIndex)
                                        .isCorrect(isCorrect)
                                        .pointsAwarded(points)
                                        .responseMs((int)(clientTimestamp - room.getQuestionStartedAt()))
                                        .build();
                                answerLogRepository.save(logEntry);
                            }

                            broadcast(sink, Map.of(
                                "type", "SCORE_UPDATE",
                                "userId", userId,
                                "score", newScore,
                                "pointsAwarded", points,
                                "isCorrect", isCorrect,
                                "doubled", doubled
                            ));

                            return roomService.saveRoom(room).then();
                        });
                });
    }

    private Mono<Void> handlePowerUp(String roomId, String userId, Map<String, Object> msg, Sinks.Many<String> sink) {
        String powerUpType = (String) msg.get("powerUpType");
        String targetId = msg.containsKey("targetId") && msg.get("targetId") != null ? String.valueOf(msg.get("targetId")) : null;

        int cost = switch (powerUpType) {
            case "INK_BLOT" -> 1;
            case "DOUBLE_POINTS" -> 3;
            default -> 0;
        };

        return roomService.getRoom(roomId)
                .flatMap(room -> {
                    if (room.getPowerUpsUsedThisGame().contains(userId)) {
                        log.info("[WS] User {} already used a powerup in room {}", userId, roomId);
                        broadcast(sink, Map.of(
                                "type", "ERROR",
                                "userId", userId,
                                "message", "You can only use 1 Power Up per game!"
                        ));
                        return Mono.empty();
                    }

                    return Mono.fromCallable(() -> userRepository.findById(Long.valueOf(userId)))
                            .flatMap(opt -> Mono.justOrEmpty(opt))
                            .flatMap(user -> {
                                if (user.getStarsBalance() >= cost) {
                                    user.setStarsBalance(user.getStarsBalance() - cost);
                                    userRepository.save(user);

                                    room.getPowerUpsUsedThisGame().add(userId);

                                    log.info("[WS] PowerUp {} (cost: {}) used by {} targeting {} in room {}", powerUpType, cost, userId, targetId, roomId);

                                    // Broadcast the sabotage event to all players in the room
                                    broadcast(sink, Map.of(
                                            "type", "SABOTAGE_EVENT",
                                            "sabotageType", powerUpType,
                                            "initiatorId", userId,
                                            "targetId", targetId != null ? targetId : ""
                                    ));

                                    // Register DOUBLE_POINTS in room state so scoring can apply 2x
                                    if ("DOUBLE_POINTS".equals(powerUpType)) {
                                        room.getDoublePointsActive().add(userId);
                                    }
                                    return roomService.saveRoom(room).then();
                                } else {
                                    log.warn("[WS] User {} attempted to use powerup {} without enough stars", userId, powerUpType);
                                }
                                return Mono.empty();
                            });
                });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Broadcast a JSON object to all subscribers of a room sink. */
    public void broadcast(Sinks.Many<String> sink, Map<String, Object> payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            Sinks.EmitResult result = sink.tryEmitNext(json);
            if (result.isFailure()) {
                log.warn("[WS] Emit failed: {}", result);
            }
        } catch (Exception e) {
            log.error("[WS] Broadcast serialization error", e);
        }
    }

    /** Broadcast to a room by ID (used by GameService scheduler). */
    public void broadcastToRoom(String roomId, Map<String, Object> payload) {
        Sinks.Many<String> sink = ROOM_SINKS.get(roomId);
        if (sink != null) broadcast(sink, payload);
    }

    private String extractQueryParam(String query, String key) {
        if (query == null) return null;
        for (String part : query.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key)) return kv[1];
        }
        return null;
    }
}
