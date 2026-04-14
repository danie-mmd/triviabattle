package za.co.triviabattle.game.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import za.co.triviabattle.users.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "tournaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, unique = true)
    private String roomId;

    @Enumerated(EnumType.STRING)
    private GameState state;

    @Column(name = "prize_pool_nano")
    private long prizePoolNano;

    @Column(name = "entry_fee_nano")
    private long entryFeeNano;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
