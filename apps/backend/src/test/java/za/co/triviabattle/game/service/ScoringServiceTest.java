package za.co.triviabattle.game.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

class ScoringServiceTest {

    private final ScoringService scoringService = new ScoringService();

    @ParameterizedTest(name = "elapsed={0}ms → expected={1}pts")
    @CsvSource({
        "0,   1000",
        "250, 1000",
        "499, 1000",
        "500,  800",
        "750,  800",
        "999,  800",
        "1000, 600",
        "1499, 600",
        "1500, 400",
        "1999, 400",
        "2000, 200",
        "5000, 200",
    })
    void correctAnswer_timeBucket_awardedCorrectly(long elapsedMs, int expectedPoints) {
        long start = 1_000_000L;
        long received = start + elapsedMs;

        int points = scoringService.calculatePoints(start, received, true);
        assertEquals(expectedPoints, points,
                "Expected " + expectedPoints + " pts for " + elapsedMs + "ms elapsed");
    }

    @Test
    void wrongAnswer_alwaysZeroPoints() {
        assertEquals(0, scoringService.calculatePoints(1_000_000L, 1_000_200L, false));
        assertEquals(0, scoringService.calculatePoints(1_000_000L, 1_099_999L, false));
    }

    @Test
    void negativeElapsed_clampsToZero_awardMaxPoints() {
        // Answer timestamp slightly before start (clock skew) → treated as 0ms elapsed
        long start = 2_000_000L;
        long received = 1_999_900L; // 100ms "before" the question
        int points = scoringService.calculatePoints(start, received, true);
        assertEquals(1000, points, "Clock skew should clamp to bucket 0 → 1000pts");
    }

    @Test
    void applyScore_accumulatesCorrectly() {
        assertEquals(1800, scoringService.applyScore(1000, 800));
        assertEquals(1000, scoringService.applyScore(0, 1000));
        assertEquals(0,    scoringService.applyScore(0, 0));
    }
}
