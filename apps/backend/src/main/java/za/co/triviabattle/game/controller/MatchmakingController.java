package za.co.triviabattle.game.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import za.co.triviabattle.game.service.MatchmakingService;

import za.co.triviabattle.users.User;
import za.co.triviabattle.users.UserRepository;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchmakingService matchmakingService;
    private final UserRepository userRepository;

    @PostMapping("/join")
    public Mono<Map<String, Object>> joinQueue(Principal principal,
                                               @RequestBody(required = false) Map<String, String> body) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Principal missing"));
        }
        String userId = principal.getName();
        String displayName = body != null ? body.getOrDefault("displayName", userId) : userId;
        String matchType = body != null ? body.getOrDefault("matchType", "TON") : "TON";
        boolean isCreditMatch = "CREDITS".equalsIgnoreCase(matchType);

        return matchmakingService.joinQueue(userId, displayName, isCreditMatch)
                .then(matchmakingService.getQueuePosition(userId))
                .map(pos -> Map.<String, Object>of("inQueue", true, "position", pos))
                .doOnError(err -> log.error("[Matchmaking] Join error for user {}: {}", userId, err.getMessage()));
    }

    @PostMapping("/leave")
    public Mono<Void> leaveQueue(Principal principal) {
        if (principal == null) return Mono.empty();
        return matchmakingService.leaveQueue(principal.getName());
    }

    @GetMapping("/status")
    public Mono<Map<String, Object>> getStatus(Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Principal missing"));
        }
        String userId = principal.getName();
        log.info("[Matchmaking] Status check requested for userId: {}", userId);
        
        Mono<User> userMono = Mono.empty();
        if (userId != null && userId.matches("\\d+")) {
            userMono = Mono.fromCallable(() -> userRepository.findById(Long.valueOf(userId)))
                    .flatMap(opt -> Mono.justOrEmpty(opt));
        }

        return userMono.defaultIfEmpty(new User()).flatMap(user -> {
                    int credits = user.getCredits() != null ? user.getCredits() : 0;
                    int stars = user.getStarsBalance();
                    return matchmakingService.getUserRoom(userId)
                            .doOnNext(room -> log.info("[Matchmaking] Status check for {}: Match Found in room {}", userId, room))
                            .map(roomId -> {
                                Map<String, Object> resp = new java.util.HashMap<>();
                                resp.put("inQueue", false);
                                resp.put("matchReady", true);
                                resp.put("roomId", roomId);
                                resp.put("roomSize", matchmakingService.getRoomSize());
                                resp.put("credits", credits);
                                resp.put("starsBalance", stars);
                                return resp;
                            })
                            .switchIfEmpty(Mono.defer(() -> Mono.zip(
                                    matchmakingService.getQueuePosition(userId),
                                    matchmakingService.getQueuePlayers()
                            ).map(tuple -> {
                                long pos = tuple.getT1();
                                List<Map<String, String>> players = (List<Map<String, String>>) tuple.getT2();
                                Map<String, Object> response = new java.util.HashMap<>();
                                response.put("credits", credits);
                                response.put("starsBalance", stars);
                                if (pos < 0) {
                                    response.put("inQueue", false);
                                    response.put("matchReady", false);
                                    response.put("position", 0);
                                    response.put("queuePlayers", players);
                                } else {
                                    response.put("inQueue", true);
                                    response.put("matchReady", false);
                                    response.put("position", pos);
                                    response.put("queuePlayers", players);
                                    response.put("roomSize", matchmakingService.getRoomSize());
                                }
                                return response;
                            })));
                })
                .doOnError(err -> log.error("[Matchmaking] Status error for user {}: {}", userId, err.getMessage()));
    }
}
