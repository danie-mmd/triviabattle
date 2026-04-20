package za.co.triviabattle.game.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Entity
@Table(name = "game_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResult {
    @Id
    private String roomId;

    private String winnerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "game_result_scores", joinColumns = @JoinColumn(name = "room_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "score")
    private Map<String, Integer> scores;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "game_result_names", joinColumns = @JoinColumn(name = "room_id"))
    @MapKeyColumn(name = "user_id")
    @Column(name = "display_name")
    private Map<String, String> playerNames;

    private double prizePool;

    @Column(name = "is_credit_match")
    private boolean isCreditMatch;
}
