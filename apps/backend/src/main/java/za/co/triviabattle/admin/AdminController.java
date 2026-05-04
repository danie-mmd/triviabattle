package za.co.triviabattle.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import za.co.triviabattle.users.User;
import za.co.triviabattle.users.UserRepository;

import java.security.Principal;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public Mono<AdminStatsDTO> getStats(Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Long userId = Long.valueOf(principal.getName());
        
        return Mono.fromCallable(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            
            if (!user.isAdmin()) {
                log.warn("[Admin] Unauthorized stats access attempt by user: {}", userId);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
            }
            
            return adminService.getStats();
        }).subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic());
    }
}
