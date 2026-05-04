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

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private static final String QUEUE_TON = "matchmaking:queue:ton";
    private static final String QUEUE_CREDITS = "matchmaking:queue:credits";
    private static final String USER_NAME_PREFIX = "matchmaking:name:";
    private static final String ACTIVE_LOBBIES_SET = "active:lobbies:set";
    private static final String TRIGGER_CHANNEL = "matchmaking:trigger";

    private final ReactiveRedisTemplate<String, Object> redis;
    private final RoomService roomService;
    private final GameService gameService;
    private final TonService tonService;
    private final TournamentRepository tournamentRepository;
    
    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private GameWebSocketHandler webSocketHandler;

    @Value("${app.game.room-size:5}")
    private int roomSize;

    @Value("${app.game.entry-fee:0}")
    private long entryFee;

    public int getRoomSize() {
        return roomSize;
    }

    @PostConstruct
    public void init() {
        log.info("[Matchmaking] INITIALIZING Phase 2 (Event-Driven) with roomSize={}, entryFee={}", roomSize, entryFee);
        
        // 1. Subscribe to matchmaking triggers for immediate processing
        redis.listenToChannel(TRIGGER_CHANNEL)
                .doOnNext(msg -> {
                    log.debug("[Matchmaking] Trigger received via Pub/Sub");
                    acquireLockAndProcess().subscribe();
                })
                .subscribe();

        // 2. Perform startup cleanup
        log.info("[Matchmaking] Clearing all matchmaking state on startup...");
        redis.delete(QUEUE_TON)
                .then(redis.delete(QUEUE_CREDITS))
                .then(redis.delete(ACTIVE_LOBBIES_SET))
                .thenMany(redis.keys(USER_NAME_PREFIX + "*").flatMap(redis::delete))
                .thenMany(redis.keys("user:room:*").flatMap(redis::delete))
                .thenMany(redis.keys("room:*").flatMap(redis::delete))
                .doOnTerminate(() -> log.info("[Matchmaking] Cleanup complete."))
                .subscribe();
    }

    public Mono<Void> joinQueue(String userId, String displayName, boolean isCreditMatch) {
        String queueKey = isCreditMatch ? QUEUE_CREDITS : QUEUE_TON;
        log.info("[Matchmaking] User {} ({}) joining {} queue", userId, displayName, isCreditMatch ? "CREDITS" : "TON");
        
        return redis.opsForValue().set(USER_NAME_PREFIX + userId, displayName, Duration.ofHours(1))
                .then(redis.opsForList().remove(queueKey, 0, userId)) 
                .then(redis.opsForList().rightPush(queueKey, userId))
                .then(redis.convertAndSend(TRIGGER_CHANNEL, "go")) // Immediate trigger
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
                                            return gameService.refundLobby(room);
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
                    
                    Mono<Void> resetMono = Mono.empty();
                    if (!isCreditMatch) {
                        log.info("[Matchmaking] Requesting ESCROW RESET for room {}", roomId);
                        resetMono = tonService.resetEscrow(roomId);
                    }

                    return Flux.fromIterable(userIds)
                        .flatMap(uid -> redis.opsForValue().set("user:room:" + uid, "CREATING_" + roomId, Duration.ofMinutes(2)))
                        .then(resetMono)
                        .then(roomService.saveRoom(room))
                        .then(redis.opsForSet().add(ACTIVE_LOBBIES_SET, roomId))
                        .thenMany(Flux.fromIterable(userIds))
                        .flatMap(uid -> redis.opsForValue().set("user:room:" + uid, roomId, Duration.ofMinutes(10)))
                        .doOnComplete(() -> {
                            // Schedule a one-shot check for when the lobby should expire
                            Mono.delay(Duration.ofMillis(61_000))
                                .flatMap(d -> acquireLockAndProcess())
                                .subscribe();
                        })
                        .then(Mono.just(room));

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

    /*private Mono<Void> harvestQueue(String queueKey, boolean isCredit) {
        return redis.opsForList().size(queueKey)
            .flatMap(size -> {
                if (size <= 0) return Mono.empty();

                return Flux.range(0, size.intValue())
                    .concatMap(i -> redis.opsForList().leftPop(queueKey).map(Object::toString))
                    .concatMap(userId -> 
                        redis.opsForSet().members(ACTIVE_LOBBIES_SET)
                            .map(Object::toString)
                            .flatMap(roomService::getRoom)
                            .filter(room -> room.isCreditMatch() == isCredit 
                                    && room.getState() == GameState.DEPOSIT_PHASE 
                                    && room.getPlayerIds().size() < roomSize)
                            .next() 
                            .flatMap(existingRoom -> addPlayerToExistingRoom(userId, existingRoom))
                            .switchIfEmpty(Mono.defer(() -> createNewRoomFromQueue(Collections.singletonList(userId), isCredit).then()))
                    )
                    .then();
            });
    }*/

private Mono<Void> harvestQueue(String queueKey, boolean isCredit) {
    return redis.opsForList().size(queueKey)
        .flatMap(size -> {
            if (size <= 0) return Mono.empty();

            return redis.opsForSet().members(ACTIVE_LOBBIES_SET)
                .map(Object::toString)
                .flatMap(roomService::getRoom)
                .filter(room -> room.isCreditMatch() == isCredit 
                        && room.getState() == GameState.DEPOSIT_PHASE 
                        && room.getPlayerIds().size() < roomSize)
                .next() 
                .flatMap(existingRoom -> {
                    return redis.opsForList().leftPop(queueKey)
                        .flatMap(uid -> addPlayerToExistingRoom(uid.toString(), existingRoom));
                })
                .switchIfEmpty(Mono.defer(() -> {
                    // Fix applied here: Added .then() to convert Mono<Room> to Mono<Void>
                    if (size >= 2 || isCredit) { 
                        int batchSize = Math.min(size.intValue(), roomSize);
                        
                        return Flux.range(0, batchSize)
                            .concatMap(i -> redis.opsForList().leftPop(queueKey).map(Object::toString))
                            .collectList()
                            .flatMap(userIds -> {
                                log.info("[Matchmaking] Forming new room with {} players", userIds.size());
                                return createNewRoomFromQueue(userIds, isCredit);
                            })
                            .then(); // <--- THIS IS THE FIX
                    }
                    return Mono.empty(); 
                }));
        });
}

    private Mono<Void> addPlayerToExistingRoom(String userId, Room room) {
        if (!room.getPlayerIds().contains(userId)) {
            room.getPlayerIds().add(userId);
        }

        // Ensure new players have at least 30 seconds to deposit
        long minRemainingMs = 30_000L;
        long now = System.currentTimeMillis();
        boolean extended = false;
        if (room.getLobbyEndsAt() - now < minRemainingMs) {
            room.setLobbyEndsAt(now + minRemainingMs);
            extended = true;
        }
        
        final boolean wasExtended = extended;
        
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
                    update.put("remainingTimeMs", room.getLobbyEndsAt() - System.currentTimeMillis());
                    if (wasExtended) {
                        update.put("message", "A new player joined! The deposit timer was extended.");
                    }
                    webSocketHandler.broadcastToRoom(room.getRoomId(), update);
                })
                .then();
    }

    private static final String MATCHMAKING_LOCK_KEY = "lock:matchmaking";
    
    // Safety watchdog: runs every minute to clean up any missed state.
    // Base polling cost reduced from 5s to 60s (91% reduction in idle chatter).
    @Scheduled(fixedDelay = 60000)
    public void watchdog() {
        tryFormRoom();
    }

    public void tryFormRoom() {
        // Idle guard: check if there is anything to do before acquiring the lock.
        // This costs only 3 Redis reads and exits immediately when the server is quiet.
        Mono.zip(
            redis.opsForList().size(QUEUE_TON).defaultIfEmpty(0L),
            redis.opsForList().size(QUEUE_CREDITS).defaultIfEmpty(0L),
            redis.opsForSet().size(ACTIVE_LOBBIES_SET).defaultIfEmpty(0L)
        ).flatMap(t -> {
            long total = t.getT1() + t.getT2() + t.getT3();
            if (total == 0) {
                return Mono.empty(); // Nothing to do — skip lock, skip all further Redis reads
            }
            return acquireLockAndProcess();
        }).subscribe();
    }

    private Mono<Void> acquireLockAndProcess() {
        // Use Redis as a distributed lock to prevent overlapping runs across multiple backend instances
        return redis.opsForValue().setIfAbsent(MATCHMAKING_LOCK_KEY, "locked", Duration.ofSeconds(10))
                .flatMap(acquired -> {
                    if (!Boolean.TRUE.equals(acquired)) {
                        return Mono.empty();
                    }

                    return harvestQueues()
                        .thenMany(redis.opsForSet().members(ACTIVE_LOBBIES_SET))
                        .map(Object::toString)
                        .flatMap(roomService::getRoom)
                        .filter(room -> room.getState() == GameState.DEPOSIT_PHASE)
                        .flatMap(room -> {
                            long now = System.currentTimeMillis();
                            long remainingMs = room.getLobbyEndsAt() - now;
                            boolean expired = remainingMs <= 0;
                            boolean full = room.getPlayerIds().size() >= roomSize;
                            boolean allConfirmed = room.getPlayerIds().stream()
                                    .allMatch(id -> room.getDepositsConfirmed().getOrDefault(id, false));

                            // Broadcast updates only if we are in the watchdog or the room is actually changing.
                            // We remove the high-frequency tick broadcast to save commands.
                            // The frontend calculates countdown locally.

                            if (expired || (full && allConfirmed)) {
                                return removeLobbyFromActiveSet(room.getRoomId())
                                        .then(processRoomStartOrRefund(room));
                            }
                            return Mono.empty();
                        })
                        .then(redis.delete(MATCHMAKING_LOCK_KEY)).then()
                        .onErrorResume(err -> {
                            log.error("[Matchmaking] Loop error: {}", err.getMessage());
                            return redis.delete(MATCHMAKING_LOCK_KEY).then();
                        });
                });
    }

   /*private Mono<Void> processRoomStartOrRefund(Room room) {
        List<String> unpaid = room.getPlayerIds().stream()
                .filter(uid -> !Boolean.TRUE.equals(room.getDepositsConfirmed().get(uid)))
                .collect(Collectors.toList());

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
                    if (count >= 2 || (count == 1 && room.isCreditMatch())) {


                        
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
                    } else if (count == 1 && !room.isCreditMatch()) {
                        return tonService.refundPrizePool(room.getRoomId())
                                .then(Mono.defer(() -> {
                                    webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                                        "type", "LOBBY_REFUNDED",
                                        "message", "Not enough players! TON matches require at least 2 players. You have been refunded."
                                    ));
                                    room.setState(GameState.GAME_OVER);
                                    return Flux.fromIterable(room.getPlayerIds())
                                        .flatMap(uid -> redis.delete("user:room:" + uid))
                                        .then(roomService.saveRoom(room));
                                })).then();
                    } else {
                        return Mono.empty();
                    }
                }));
    }*/

    /*private Mono<Void> processRoomStartOrRefund(Room room) {
        List<String> unpaid = room.getPlayerIds().stream()
                .filter(uid -> !Boolean.TRUE.equals(room.getDepositsConfirmed().get(uid)))
                .collect(Collectors.toList());

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
                    
                    if (count >= 2 || (count == 1 && room.isCreditMatch())) {
                        Mono<Void> escrowSetup = room.isCreditMatch() 
                            ? Mono.empty() 
                            : tonService.resetEscrow(room.getRoomId());

                        return escrowSetup.then(Mono.fromCallable(() -> {
                            Tournament tournament = Tournament.builder()
                                    .roomId(room.getRoomId())
                                    .state(GameState.DEPOSIT_PHASE)
                                    .entryFeeNano(entryFee)
                                    .build();
                            return tournamentRepository.save(tournament);
                        })).flatMap(saved -> {
                            room.setDatabaseTournamentId(saved.getId());
                            room.setState(GameState.WAITING); 
                            return roomService.saveRoom(room)
                                    .then(gameService.startMatch(room)); // startMatch returns Mono<Void>
                        });
                    } 
                    else if (count == 1 && !room.isCreditMatch()) {
                        return tonService.refundPrizePool(room.getRoomId())
                                .then(Mono.defer(() -> {
                                    webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                                        "type", "LOBBY_REFUNDED",
                                        "message", "Not enough players! You have been refunded."
                                    ));
                                    room.setState(GameState.GAME_OVER);
                                    return Flux.fromIterable(room.getPlayerIds())
                                        .flatMap(uid -> redis.delete("user:room:" + uid))
                                        .then(roomService.saveRoom(room)); 
                                })).then(); // Ensures the branch returns Mono<Void>
                    } 
                    else {
                        room.setState(GameState.GAME_OVER);
                        return roomService.saveRoom(room).then(); // Converts Mono<Boolean> to Mono<Void>
                    }
                }));
    }*/

// Inside MatchmakingService.java -> processRoomStartOrRefund
    private Mono<Void> processRoomStartOrRefund(Room room) {
        List<String> unpaid = room.getPlayerIds().stream()
                .filter(uid -> !Boolean.TRUE.equals(room.getDepositsConfirmed().get(uid)))
                .collect(Collectors.toList());

        // Only kick unpaid players if the lobby has actually expired
        if (System.currentTimeMillis() >= room.getLobbyEndsAt()) {
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
        }

        return Flux.fromIterable(unpaid)
                .flatMap(uid -> redis.delete("user:room:" + uid))
                .then(Mono.defer(() -> {
                    int count = room.getPlayerIds().size();
                    long now = System.currentTimeMillis();
                    boolean isExpired = now >= room.getLobbyEndsAt();
                    
                    if (count >= 2 || (count == 1 && room.isCreditMatch())) {
                        // Normal start logic...
                        return Mono.fromCallable(() -> {
                            Tournament tournament = Tournament.builder()
                                    .roomId(room.getRoomId())
                                    .state(GameState.DEPOSIT_PHASE)
                                    .entryFeeNano(entryFee)
                                    .build();
                            return tournamentRepository.save(tournament);
                        }).flatMap(saved -> {
                            room.setDatabaseTournamentId(saved.getId());
                            room.setState(GameState.WAITING); 
                            return roomService.saveRoom(room)
                                    .then(gameService.startMatch(room));
                        });
                    } 
                    else if (count == 1 && !room.isCreditMatch() && isExpired) {
                        webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                                "type", "LOBBY_REFUNDING",
                                "message", "Waiting for refund transaction to clear from blockchain..."
                        ));
                        // CRITICAL: Only call refund if isExpired is true
                        return tonService.refundPrizePool(room.getRoomId())
                                .then(Mono.defer(() -> {
                                    webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                                        "type", "LOBBY_REFUNDED",
                                        "message", "Not enough players! You have been refunded."
                                    ));
                                    room.setState(GameState.GAME_OVER);
                                    return Flux.fromIterable(room.getPlayerIds())
                                        .flatMap(uid -> redis.delete("user:room:" + uid))
                                        .then(roomService.saveRoom(room)); 
                                })).then();
                    } 
                    else {
                        // If not expired and not enough players, stay in DEPOSIT_PHASE
                        if (!isExpired && !room.isCreditMatch()) {
                            return Mono.empty(); 
                        }
                        room.setState(GameState.GAME_OVER);
                        return roomService.saveRoom(room).then();
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
