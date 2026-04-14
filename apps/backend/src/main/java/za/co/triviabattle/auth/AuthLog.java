package za.co.triviabattle.auth;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "auth_logs")
@Data
public class AuthLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    private String username;

    @Enumerated(EnumType.STRING)
    private AuthStatus status;

    @Column(name = "ip_address")
    private String ipAddress;

   @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

@PrePersist
protected void onCreate() {
    this.createdAt = LocalDateTime.now();
}    

    public enum AuthStatus {
        SUCCESS, 
        FAILED_INVALID_SIGNATURE, 
        FAILED_EXPIRED, 
        ERROR
    }    
}