package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import za.co.triviabattle.game.model.TournamentPlayer;
import za.co.triviabattle.game.model.TournamentPlayerId;

public interface TournamentPlayerRepository extends JpaRepository<TournamentPlayer, TournamentPlayerId> {
    @Query("SELECT COALESCE(SUM(tp.tournament.entryFeeNano), 0) FROM TournamentPlayer tp")
    long sumAllEntryFees();

    @Query("SELECT COALESCE(SUM(tp.tonPayoutNano), 0) FROM TournamentPlayer tp")
    long sumAllPayouts();
}
