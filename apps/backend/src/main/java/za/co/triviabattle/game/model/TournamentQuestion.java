package za.co.triviabattle.game.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tournament_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentQuestion {
    @EmbeddedId
    private TournamentQuestionId id;

    @ManyToOne
    @MapsId("tournamentId")
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne
    @MapsId("questionId")
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(name = "question_order")
    private Byte questionOrder;
}
