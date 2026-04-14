package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import za.co.triviabattle.game.model.GameResult;

@Repository
public interface GameResultRepository extends JpaRepository<GameResult, String> {
}
