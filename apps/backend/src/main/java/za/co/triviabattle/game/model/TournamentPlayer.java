package za.co.triviabattle.game.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import za.co.triviabattle.users.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_players")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentPlayer {
    @EmbeddedId
    private TournamentPlayerId id;

    @ManyToOne
    @MapsId("tournamentId")
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "final_score")
    private int finalScore;

    @Column(name = "player_rank")
    private Byte playerRank;

    @Column(name = "ton_payout_nano")
    private long tonPayoutNano;

    @Column(name = "paid")
    private boolean paid;

    @Column(name = "joined_at", insertable = false, updatable = false)
    private LocalDateTime joinedAt;
}
