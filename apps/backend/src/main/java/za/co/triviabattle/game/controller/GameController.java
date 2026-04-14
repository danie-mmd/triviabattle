package za.co.triviabattle.game.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import za.co.triviabattle.game.model.GameResult;
import za.co.triviabattle.game.model.GameState;
import za.co.triviabattle.game.repository.GameResultRepository;
import za.co.triviabattle.game.service.RoomService;

import java.security.Principal;
import java.util.Map;
import za.co.triviabattle.users.UserRepository;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Slf4j
@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameController {
    private final GameResultRepository gameResultRepository;
    private final RoomService roomService;
    private final UserRepository userRepository;

    @GetMapping("/{roomId}/result")
    public Mono<GameResult> getResult(@PathVariable String roomId) {
        return Mono.fromCallable(() -> gameResultRepository.findById(roomId))
                .flatMap(opt -> Mono.justOrEmpty(opt));
    }

    /**
     * Called by the frontend after the TonConnect transaction succeeds.
     * Using HTTP instead of WebSocket because the WS connection drops when TonKeeper opens.
     */
    @PostMapping("/{roomId}/confirm-deposit")
    public Mono<Map<String, Object>> confirmDeposit(@PathVariable String roomId, Principal principal) {
        String userId = principal.getName();
        return roomService.getRoom(roomId)
                .flatMap(room -> {
                    if (room.getState() != GameState.DEPOSIT_PHASE) {
                        Map<String, Object> r = new java.util.HashMap<>();
                        r.put("status", "ignored"); r.put("reason", "Not in deposit phase");
                        return Mono.just(r);
                    }

                    Mono<Void> processDeposit = Mono.empty();
                    if (room.isCreditMatch()) {
                        log.info("[CreditMatch] ConfirmDeposit: user {} in room {}", userId, roomId);
                        processDeposit = Mono.fromCallable(() -> userRepository.findById(Long.valueOf(userId)))
                                .flatMap(opt -> Mono.justOrEmpty(opt))
                                .flatMap(user -> {
                                    int current = (user.getCredits() != null ? user.getCredits() : 0);
                                    if (current > 0) {
                                        user.setCredits(current - 1);
                                        log.info("[CreditMatch] DEDUCTING: user {} (from {} to {})", userId, current, user.getCredits());
                                        return Mono.<Void>fromRunnable(() -> userRepository.saveAndFlush(user));
                                    } else {
                                        log.warn("[CreditMatch] INSUFFICIENT CREDITS: user {} has {}", userId, current);
                                        return Mono.error(new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Insufficient credits"));
                                    }
                                });
                    }

                    return processDeposit.then(Mono.defer(() -> {
                        room.getDepositsConfirmed().put(userId, true);
                        log.info("[Deposit] Confirmed for user {} in room {}. Total confirmed: {}", 
                                userId, roomId, room.getDepositsConfirmed().size());

                        Map<String, Object> waiting = new java.util.HashMap<>();
                        waiting.put("status", "waiting");
                        waiting.put("confirmed", room.getDepositsConfirmed().size());
                        waiting.put("total", room.getPlayerIds().size());
                        // CRITICAL: Save the room even if we are still waiting! MatchmakingService will start the match when appropriate.
                        return roomService.saveRoom(room).thenReturn(waiting);
                    }));
                })
                .switchIfEmpty(Mono.fromCallable(() -> {
                    Map<String, Object> err = new java.util.HashMap<>();
                    err.put("status", "error"); err.put("reason", "Room not found");
                    return err;
                }));
    }
}
