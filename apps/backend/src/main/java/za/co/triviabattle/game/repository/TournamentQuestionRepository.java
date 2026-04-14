package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.triviabattle.game.model.TournamentQuestion;
import za.co.triviabattle.game.model.TournamentQuestionId;

public interface TournamentQuestionRepository extends JpaRepository<TournamentQuestion, TournamentQuestionId> {
}
