package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.triviabattle.game.model.TournamentPlayer;
import za.co.triviabattle.game.model.TournamentPlayerId;

public interface TournamentPlayerRepository extends JpaRepository<TournamentPlayer, TournamentPlayerId> {
}
