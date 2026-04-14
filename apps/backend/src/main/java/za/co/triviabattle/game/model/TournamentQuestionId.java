package za.co.triviabattle.game.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentQuestionId implements Serializable {
    @Column(name = "tournament_id")
    private Long tournamentId;

    @Column(name = "question_id")
    private Long questionId;
}
