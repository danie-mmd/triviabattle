package za.co.triviabattle.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalTournaments;
    private long totalEntryFeesNano;
    private long totalPayoutsNano;
    private long profitNano;
    private double profitMargin;
}
