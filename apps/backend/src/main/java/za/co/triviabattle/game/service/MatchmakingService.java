package za.co.triviabattle.game.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

import za.co.triviabattle.game.model.GameState;
import za.co.triviabattle.game.model.Room;
import za.co.triviabattle.game.model.Tournament;
import za.co.triviabattle.game.repository.TournamentRepository;
import za.co.triviabattle.game.handler.GameWebSocketHandler;
import za.co.triviabattle.payment.TonService;

/**
 * MatchmakingService
 *
 * Uses two Redis structures:
 *  - ZSET  "queue"            → userId, score=joinTimestamp (FIFO ordering)
 *  - Hash  "queue:meta:{uid}" → displayName
 *
 * Every 2 seconds, tryFormRoom() checks if ≥ ROOM_SIZE players are waiting.
 * If so, it pops them, creates a Room, and persists it to Redis.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private static final String QUEUE_TON = "matchmaking:queue:ton";
    private static final String QUEUE_CREDITS = "matchmaking:queue:credits";
    private static final String USER_NAME_PREFIX = "matchmaking:name:";
    private static final String ACTIVE_LOBBIES_SET = "active:lobbies:set";

    private final ReactiveRedisTemplate<String, Object> redis;
    private final RoomService roomService;
    private final GameService gameService;
    private final TonService tonService;
    private final TournamentRepository tournamentRepository;
    private final GameWebSocketHandler webSocketHandler;

    @Value("${app.game.room-size:1}")
    private int roomSize;

    @Value("${app.game.entry-fee:0}")
    private long entryFee;

    public int getRoomSize() {
        return roomSize;
    }

    @PostConstruct
    public void init() {
        log.info("[Matchmaking] INITIALIZING with roomSize={}, entryFee={}", roomSize, entryFee);
        log.info("[Matchmaking] Clearing all matchmaking state on startup...");
        
        redis.delete(QUEUE_TON)
                .then(redis.delete(QUEUE_CREDITS))
                .then(redis.delete(ACTIVE_LOBBIES_SET))
                .subscribe();
                
        redis.keys(USER_NAME_PREFIX + "*").flatMap(redis::delete).subscribe();
        redis.keys("user:room:*").flatMap(redis::delete).subscribe();
        log.info("[Matchmaking] Cleanup complete.");
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public Mono<Void> joinQueue(String userId, String displayName, boolean isCreditMatch) {
        String queueKey = isCreditMatch ? QUEUE_CREDITS : QUEUE_TON;
        log.info("[Matchmaking] User {} ({}) joining {} queue", userId, displayName, isCreditMatch ? "CREDITS" : "TON");
        
        return redis.opsForValue().set(USER_NAME_PREFIX + userId, displayName, Duration.ofHours(1))
                .then(redis.opsForList().remove(queueKey, 0, userId)) // Avoid duplicates
                .then(redis.opsForList().rightPush(queueKey, userId))
                .then();
    }

    public Mono<Void> leaveQueue(String userId) {
        log.info("[Matchmaking] User {} leaving queue", userId);
        return redis.opsForList().remove(QUEUE_TON, 0, userId)
                .then(redis.opsForList().remove(QUEUE_CREDITS, 0, userId))
                .then(getUserRoom(userId)
                    .flatMap(roomId -> roomService.getRoom(roomId)
                        .flatMap(room -> {
                            boolean hasPaid = Boolean.TRUE.equals(room.getDepositsConfirmed().get(userId));
                            room.getPlayerIds().remove(userId);
                            room.getPlayerNames().remove(userId);
                            room.getScores().remove(userId);
                            room.getDepositsConfirmed().remove(userId);
                            
                            return roomService.saveRoom(room)
                                .flatMap(ok -> {
                                    if (hasPaid) {
                                        if (room.isCreditMatch()) {
                                            return gameService.refundPlayerCredit(userId, true);
                                        } else {
                                            log.info("[Matchmaking] User {} left queue after TON deposit. Triggering lobby refund for room {}", userId, room.getRoomId());
                                            return gameService.refundLobby(room); // Refund the whole lobby if someone leaves mid-deposit
                                        }
                                    }
                                    return Mono.empty();
                                });
                        })
                    )
                )

                .then(redis.delete("user:room:" + userId))
                .then();
    }

    private Mono<Room> createNewRoomFromQueue(List<String> userIds, boolean isCreditMatch) {
        String roomId = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        long lobbyEndsAt = System.currentTimeMillis() + 60_000;
        
        return Flux.fromIterable(userIds)
                .flatMap(uid -> redis.opsForValue().get(USER_NAME_PREFIX + uid)
                        .map(Object::toString)
                        .defaultIfEmpty("Player")
                        .map(name -> Map.entry(uid, name)))
                .collectList()
                .flatMap(entries -> {
                    Map<String, String> namesMap = new HashMap<>();
                    entries.forEach(e -> namesMap.put(e.getKey(), e.getValue()));
                    
                    Room room = Room.builder()
                            .roomId(roomId)
                            .playerIds(new ArrayList<>(userIds))
                            .playerNames(namesMap)
                            .scores(new HashMap<>())
                            .state(GameState.DEPOSIT_PHASE)
                            .lobbyEndsAt(lobbyEndsAt)
                            .isCreditMatch(isCreditMatch)
                            .build();
                    
                    log.info("[Matchmaking] FORMING {} ROOM {} with {} players", isCreditMatch ? "CREDIT" : "TON", roomId, userIds.size());
                    
                    if (!isCreditMatch) {
                        log.info("[Matchmaking] Triggering ESCROW RESET in background for room {}", roomId);
                        tonService.resetEscrow(roomId).subscribe();
                    }

                    return redis.opsForSet().add(ACTIVE_LOBBIES_SET, roomId)
                            .thenMany(Flux.fromIterable(userIds))
                            .flatMap(uid -> redis.opsForValue().set("user:room:" + uid, roomId, Duration.ofMinutes(10)))
                            .then(roomService.saveRoom(room))
                            .thenReturn(room);
                });
    }

    public Mono<Void> removeLobbyFromActiveSet(String roomId) {
        return redis.opsForSet().remove(ACTIVE_LOBBIES_SET, roomId).then();
    }

    public Mono<Long> getQueuePosition(String userId) {
        return getUserRoom(userId).map(r -> 1L)
                .switchIfEmpty(redis.opsForList().range(QUEUE_TON, 0, -1)
                        .map(Object::toString)
                        .collectList()
                        .map(list -> (long) list.indexOf(userId) + 1)
                        .filter(pos -> pos > 0))
                .switchIfEmpty(redis.opsForList().range(QUEUE_CREDITS, 0, -1)
                        .map(Object::toString)
                        .collectList()
                        .map(list -> (long) list.indexOf(userId) + 1)
                        .filter(pos -> pos > 0))
                .defaultIfEmpty(-1L);
    }

    public Mono<List<Map<String, String>>> getQueuePlayers() {
        return Mono.zip(
                redis.opsForList().range(QUEUE_TON, 0, -1).map(Object::toString).collectList(),
                redis.opsForList().range(QUEUE_CREDITS, 0, -1).map(Object::toString).collectList()
        ).flatMap(tuple -> {
            List<String> allUids = new ArrayList<>(tuple.getT1());
            allUids.addAll(tuple.getT2());
            
            return Flux.fromIterable(allUids)
                    .flatMap(uid -> redis.opsForValue().get(USER_NAME_PREFIX + uid)
                            .map(Object::toString)
                            .defaultIfEmpty("Player")
                            .map(name -> Map.of("userId", uid, "name", name)))
                    .collectList();
        });
    }

    private Mono<Void> harvestQueues() {
        return harvestQueue(QUEUE_TON, false)
                .then(harvestQueue(QUEUE_CREDITS, true));
    }

 
private Mono<Void> harvestQueue(String queueKey, boolean isCredit) {
    return redis.opsForList().size(queueKey)
        .flatMap(size -> {
            if (size <= 0) return Mono.empty();

            // Process all pending players in the queue
            return Flux.range(0, size.intValue())
                .flatMap(i -> redis.opsForList().leftPop(queueKey).map(Object::toString))
                .flatMap(userId -> 
                    redis.opsForSet().members(ACTIVE_LOBBIES_SET)
                        .map(Object::toString)
                        .flatMap(roomService::getRoom)
                        .filter(room -> room.isCreditMatch() == isCredit 
                                && room.getState() == GameState.DEPOSIT_PHASE 
                                && room.getPlayerIds().size() < roomSize)
                        .next() 
                        .flatMap(existingRoom -> {
                            log.info("[Matchmaking] Adding player {} to existing lobby {}", userId, existingRoom.getRoomId());
                            return addPlayerToExistingRoom(userId, existingRoom);
                        })
                        .switchIfEmpty(Mono.defer(() -> {
                            log.info("[Matchmaking] No existing lobby for {}, creating new one.", userId);
                            return createNewRoomFromQueue(Collections.singletonList(userId), isCredit).then();
                        }))
                )
                .then();
        })
        .then();
}

/**
 * Helper to add a user to a room already in the DEPOSIT_PHASE.
 */
private Mono<Void> addPlayerToExistingRoom(String userId, Room room) {
    if (!room.getPlayerIds().contains(userId)) {
        room.getPlayerIds().add(userId);
    }
    
    return redis.opsForValue().get(USER_NAME_PREFIX + userId)
            .map(Object::toString)
            .defaultIfEmpty("Player")
            .flatMap(name -> {
                room.getPlayerNames().put(userId, name);
                return redis.opsForValue().set("user:room:" + userId, room.getRoomId(), Duration.ofHours(1));
            })
            .then(roomService.saveRoom(room))
            .doOnSuccess(v -> {
                Map<String, Object> update = new HashMap<>();
                update.put("type", "LOBBY_UPDATE");
                update.put("playerCount", room.getPlayerIds().size());
                webSocketHandler.broadcastToRoom(room.getRoomId(), update);
            })
            .then();
}

    // ── Scheduled room formation ──────────────────────────────────────────────

    @Scheduled(fixedDelay = 2000)
    public void tryFormRoom() {
        harvestQueues()
                .thenMany(redis.opsForSet().members(ACTIVE_LOBBIES_SET))
                .map(Object::toString)
                .flatMap(roomId -> roomService.getRoom(roomId))
                .filter(room -> room.getState() == GameState.DEPOSIT_PHASE)
                .flatMap(room -> {
                    long now = System.currentTimeMillis();
                    long remainingMs = room.getLobbyEndsAt() - now;
                    boolean expired = remainingMs <= 0;
                    boolean full = room.getPlayerIds().size() >= roomSize;
                    boolean allConfirmed = room.getPlayerIds().stream()
                            .allMatch(id -> room.getDepositsConfirmed().getOrDefault(id, false));

                    // Broadcast LOBBY_UPDATE
                    webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                            "type", "LOBBY_UPDATE",
                            "playerCount", room.getPlayerIds().size(),
                            "remainingTimeMs", remainingMs
                    ));

                    if (expired || (full && allConfirmed)) {
                        int count = room.getPlayerIds().size();
                        log.info("[Matchmaking] LOBBY {} TRIGGERED: players={}, expired={}, isCredit={}", 
                                room.getRoomId(), count, expired, room.isCreditMatch());
                        
                        return removeLobbyFromActiveSet(room.getRoomId())
                                .then(processRoomStartOrRefund(room));
                    }
                    return Mono.empty();
                })
                .subscribe();
    }

    private Mono<Void> processRoomStartOrRefund(Room room) {
        List<String> unpaid = room.getPlayerIds().stream()
                .filter(uid -> !Boolean.TRUE.equals(room.getDepositsConfirmed().get(uid)))
                .toList();

        unpaid.forEach(uid -> {
            room.getPlayerIds().remove(uid);
            room.getPlayerNames().remove(uid);
            room.getScores().remove(uid);
            webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                "type", "LOBBY_KICK",
                "userId", uid,
                "message", "You did not lock in your entry in time."
            ));
        });

        return Flux.fromIterable(unpaid)
                .flatMap(uid -> redis.delete("user:room:" + uid))
                .then(Mono.defer(() -> {
                    int count = room.getPlayerIds().size();
                    if (count >= 1) {
                        log.info("[Matchmaking] STARTING room {} with {} paid players", room.getRoomId(), count);
                        Tournament tournament = Tournament.builder()
                                .roomId(room.getRoomId())
                                .state(GameState.DEPOSIT_PHASE)
                                .entryFeeNano(entryFee)
                                .build();
                        
                        return Mono.fromCallable(() -> tournamentRepository.save(tournament))
                                .flatMap(saved -> {
                                    room.setDatabaseTournamentId(saved.getId());
                                    room.setState(GameState.WAITING); 
                                    return roomService.saveRoom(room)
                                            .then(gameService.startMatch(room));
                                });
                    } else {
                        return Mono.empty();
                    }
                }));
    }

    public Mono<Boolean> saveRoom(Room room) {
        return roomService.saveRoom(room);
    }

    public Mono<String> getUserRoom(String userId) {
        return redis.opsForValue().get("user:room:" + userId)
                .map(Object::toString);
    }
}
