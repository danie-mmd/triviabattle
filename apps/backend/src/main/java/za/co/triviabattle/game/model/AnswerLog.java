package za.co.triviabattle.game.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "answer_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournament_id")
    private Long tournamentId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "selected_index")
    private Byte selectedIndex;

    @Column(name = "is_correct")
    private boolean isCorrect;

    @Column(name = "points_awarded")
    private int pointsAwarded;

    @Column(name = "response_ms")
    private int responseMs;

    @Column(name = "answered_at", insertable = false, updatable = false)
    private LocalDateTime answeredAt;
}
