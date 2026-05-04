package za.co.triviabattle.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import za.co.triviabattle.users.UserRepository;
import za.co.triviabattle.game.repository.TournamentRepository;
import za.co.triviabattle.game.repository.TournamentPlayerRepository;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentPlayerRepository tournamentPlayerRepository;

    public AdminStatsDTO getStats() {
        long totalUsers = userRepository.count();
        long totalTournaments = tournamentRepository.countAll();
        long totalEntryFees = tournamentPlayerRepository.sumAllEntryFees();
        long totalPayouts = tournamentPlayerRepository.sumAllPayouts();
        
        long profit = totalEntryFees - totalPayouts;
        double margin = totalEntryFees > 0 ? (double) profit / totalEntryFees : 0;

        return AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalTournaments(totalTournaments)
                .totalEntryFeesNano(totalEntryFees)
                .totalPayoutsNano(totalPayouts)
                .profitNano(profit)
                .profitMargin(margin)
                .build();
    }
}
