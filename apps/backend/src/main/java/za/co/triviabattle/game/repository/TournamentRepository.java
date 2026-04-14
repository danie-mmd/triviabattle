package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.triviabattle.game.model.Tournament;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}
