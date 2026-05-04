package za.co.triviabattle.users;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    private Long id; // Telegram ID

    private String username;

    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "stars_balance")
    private int starsBalance = 0;
    
    @Column(name = "wallet_address")
    private String walletAddress;
    
    private Integer credits = 20;

    @Column(name = "is_admin", columnDefinition = "TINYINT(1)")
    private boolean isAdmin = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

