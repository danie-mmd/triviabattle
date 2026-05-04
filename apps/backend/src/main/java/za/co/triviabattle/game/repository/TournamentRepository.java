package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import za.co.triviabattle.game.model.Tournament;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    @Query("SELECT COUNT(t) FROM Tournament t")
    long countAll();
}
