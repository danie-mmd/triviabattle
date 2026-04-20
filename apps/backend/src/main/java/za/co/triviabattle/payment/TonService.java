package za.co.triviabattle.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import za.co.triviabattle.users.UserRepository;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TonService {

    private final UserRepository userRepository;
    private final WebClient webClient = WebClient.create("http://localhost:3001");

    /**
     * Executes the prize payout on the TON blockchain by triggering the dedicated
     * Node.js Ton Payout Microservice via an internal API call.
     */
    public Mono<Void> payoutToWinner(String roomId, String winnerId, double prizeTon, double feeTon) {
        if (winnerId == null) {
            log.warn("[TonService] No winner to payout for room {}", roomId);
            return Mono.empty();
        }

        var userOpt = userRepository.findById(Long.valueOf(winnerId));
        if (userOpt.isPresent()) {
            String wallet = userOpt.get().getWalletAddress();
            if (wallet != null && !wallet.isEmpty()) {
                log.info("[TonService] Triggering Node.js microservice payout: Sending {} prize + {} fee for room {}", 
                        prizeTon, feeTon, roomId);

                return webClient.post()
                        .uri("/api/payout")
                        .bodyValue(Map.of(
                                "roomId", roomId,
                                "winnerId", winnerId,
                                "walletAddress", wallet,
                                "prizeTon", prizeTon,
                                "feeTon", feeTon
                        ))
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnSuccess(v -> log.info("[TonService] Successfully requested payout for room {}", roomId))
                        .doOnError(e -> log.error("[TonService] Failed executing payout via microservice: {}", e.getMessage()));
            } else {
                log.error("[TonService] Winner {} has no wallet address connected for room {}", winnerId, roomId);
                return Mono.empty();
            }
        } else {
            log.error("[TonService] Could not find user {} for payout in room {}", winnerId, roomId);
            return Mono.empty();
        }
    }
    public Mono<Void> refundPrizePool(String roomId) {
        log.info("[TonService] Triggering Node.js microservice refund for room {}", roomId);

        return webClient.post()
                .uri("/api/refund")
                .bodyValue(Map.of("roomId", roomId))
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("[TonService] Successfully requested refund for room {}", roomId))
                .doOnError(e -> log.error("[TonService] Failed executing refund via microservice: {}", e.getMessage()));
    }

    /**
     * Resets the reusable Escrow contract for a new game room.
     */
    public Mono<Void> resetEscrow(String roomId) {
        log.info("[TonService] Triggering Node.js microservice reset for new room {}", roomId);

        return webClient.post()
                .uri("/api/reset")
                .bodyValue(Map.of("roomId", roomId))
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("[TonService] Successfully requested escrow reset for room {}", roomId))
                .doOnError(e -> log.error("[TonService] Failed executing escrow reset: {}", e.getMessage()));
    }
}

