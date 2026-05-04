package za.co.triviabattle.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@Slf4j
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiry-ms}")
    private long jwtExpiryMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            log.error("[JWT] Secret is missing!");
        } else {
            log.info("[JWT] Initializing with secret of length: {}", jwtSecret.length());
            if (jwtSecret.startsWith("change_me")) {
                log.warn("[JWT] Using default/placeholder secret!");
            }
        }
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(TelegramUser user, boolean isAdmin) {
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("firstName", user.getFirstName())
                .claim("username", user.getUsername())
                .claim("isPremium", user.isPremium())
                .claim("isAdmin", isAdmin)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiryMs))
                .signWith(signingKey)
                .compact();
    }

    public Optional<Claims> validateToken(String token) {
        try {
            return Optional.of(Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload());
        } catch (Exception e) {
            log.warn("[JWT] Token validation failed: {} (token start: {}...)", e.getMessage(), 
                    token.length() > 10 ? token.substring(0, 10) : token);
            return Optional.empty();
        }
    }

    public String getUserId(Claims claims) {
        return claims.getSubject();
    }
}
