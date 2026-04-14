package za.co.triviabattle.payment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import za.co.triviabattle.users.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class TonService {

    private final UserRepository userRepository;

    /**
     * Executes the prize payout on the TON blockchain by sending a Smart Contract message
     * to the Escrow contract.
     * 
     * Note: Full BoC (Bag of Cells) creation requires a TON SDK like ton4j.
     */
    public Mono<Void> payoutToWinner(String roomId, String winnerId, double prizeTon) {
        if (winnerId == null) {
            log.warn("[TonService] No winner to payout for room {}", roomId);
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> {
            var userOpt = userRepository.findById(Long.valueOf(winnerId));
            if (userOpt.isPresent()) {
                String wallet = userOpt.get().getWalletAddress();
                if (wallet != null && !wallet.isEmpty()) {
                    log.info("[TonService] MOCK PAYOUT: Sending {} TON to wallet {} for winner {} in room {}", 
                            prizeTon, wallet, winnerId, roomId);
                    // TODO: Implement ton4j logic to send "Payout" message with BoC to the Escrow contract
                } else {
                    log.error("[TonService] Winner {} has no wallet address connected for room {}", winnerId, roomId);
                }
            } else {
                log.error("[TonService] Could not find user {} for payout in room {}", winnerId, roomId);
            }
        });
    }
}
