package za.co.triviabattle.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import za.co.triviabattle.users.User;
import za.co.triviabattle.users.UserRepository;

import java.security.Principal;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    @Value("${app.bot-token}")
    private String botToken;

    private final JwtService jwtService;
    private final UserRepository userRepository; // Added
    private final AuthLogRepository authLogRepository; // Added
    
    /**
     * POST /api/auth/login
     * Body: { "initData": "<raw Telegram initData>" }
     *
     * Validates the HMAC signature, then issues a signed JWT.
     */
    @PostMapping("/login")
    public Mono<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<TelegramUser> tgUserOpt;

        // MOCK AUTH for local testing
        if (request.initData() != null && request.initData().startsWith("mockUser=")) {
            String mockIdStr = request.initData().replace("mockUser=", "");
            long mockId = 1000L + Long.parseLong(mockIdStr);
            tgUserOpt = Optional.of(TelegramUser.builder()
                    .id(mockId)
                    .username("MockUser" + mockIdStr)
                    .firstName("Mock" + mockIdStr)
                    .build());
            log.info("[Auth] Using MOCK auth bypass for id: {}", mockId);
        } else {
            // 1. Attempt to parse user data regardless of hash status for logging
            tgUserOpt = TelegramAuthUtils.parseUser(request.initData());
            
            // 2. Validate HMAC Signature
            if (!TelegramAuthUtils.validateInitData(request.initData(), botToken)) {
                log.warn("[Auth] Invalid initData received");
                saveAuthLog(tgUserOpt, AuthLog.AuthStatus.FAILED_INVALID_SIGNATURE);
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Telegram auth data");
            }
        }

        TelegramUser tgUser = tgUserOpt.orElseThrow(() -> 
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not parse user"));

        // 3. Persistence: Upsert User into MySQL
        User user = userRepository.findById(tgUser.getId()).orElse(new User());
        user.setId(tgUser.getId());
        user.setUsername(tgUser.getUsername());
        user.setFirstName(tgUser.getFirstName());
        user.setPhotoUrl(tgUser.getPhotoUrl());
        // Set initial credits if new user
        if (user.getCreatedAt() == null) {
            user.setCredits(20); 
            user.setStarsBalance(20);
        }
        userRepository.save(user);

        // 4. Log Success
        saveAuthLog(tgUserOpt,AuthLog.AuthStatus.SUCCESS);

        String token = jwtService.generateToken(tgUser, user.isAdmin());
        log.info("[Auth] Login success for user={} ({})", tgUser.getId(), tgUser.getUsername());

        return Mono.just(new LoginResponse(
                token,
                String.valueOf(tgUser.getId()),
                tgUser.getUsername() != null ? tgUser.getUsername() : tgUser.getFirstName(),
                tgUser.getFirstName(),
                tgUser.getPhotoUrl(),
                user.getStarsBalance(),
                user.getCredits() != null ? user.getCredits() : 0,
                user.isAdmin()
        ));
    }

    private void saveAuthLog(Optional<TelegramUser> user, AuthLog.AuthStatus status) {
        AuthLog logEntry = new AuthLog();
        user.ifPresent(u -> {
            logEntry.setUserId(u.getId());
            logEntry.setUsername(u.getUsername());
        });
        logEntry.setStatus(status);
        authLogRepository.save(logEntry);
    } 

    @PutMapping("/wallet")
    public Mono<Void> updateWallet(Principal principal, @RequestBody WalletUpdateRequest request) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Principal missing"));
        }
        Long userId = Long.valueOf(principal.getName());
        return Mono.fromRunnable(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            user.setWalletAddress(request.walletAddress());
            userRepository.save(user);
        });
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    public record LoginRequest(String initData) {}

    public record WalletUpdateRequest(String walletAddress) {}

    public record LoginResponse(
            String token,
            String userId,
            String username,
            String firstName,
            String photoUrl,
            int starsBalance,
            int credits,
            boolean isAdmin
    ) {}
}
