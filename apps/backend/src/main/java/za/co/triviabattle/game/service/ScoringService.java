package za.co.triviabattle.game.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * ScoringService – Time-Bucket scoring
 *
 * Points are awarded based on how quickly a correct answer is submitted
 * relative to when the question was pushed, normalizing network latency
 * into 500ms buckets.
 *
 * Bucket table:
 *  ┌─────────────────┬────────┐
 *  │ Response time   │ Points │
 *  ├─────────────────┼────────┤
 *  │   0 – 2000 ms   │  400  │
 *  │ 2000 – 4000 ms  │   350  │
 *  │ 4000 – 6000 ms  │   300  │
 *  │ 6000 – 8000 ms  │   250  │
 *  │ 8000+ ms        │   200  │
 *  │ Wrong / timeout │     0  │
 *  └─────────────────┴────────┘
 */
@Slf4j
@Service
public class ScoringService {

    private static final int[] BUCKET_POINTS  = {400, 350, 300, 250, 200};
    private static final long  BUCKET_SIZE_MS = 2000L;

    /**
     * Calculate points for a correct answer.
     *
     * @param questionStartedAt epoch millis when the question was pushed to clients
     * @param answerReceivedAt  epoch millis when the server received the answer
     * @param isCorrect         whether the selected option is correct
     * @return points to award (0 if wrong)
     */
    public int calculatePoints(long questionStartedAt, long answerReceivedAt, boolean isCorrect) {
        if (!isCorrect) return 0;

        long elapsed = answerReceivedAt - questionStartedAt;
        if (elapsed < 0) elapsed = 0; // clock skew guard

        int bucketIndex = (int) (elapsed / BUCKET_SIZE_MS);

        if (bucketIndex >= BUCKET_POINTS.length) {
            // Answered correctly but very slowly – minimum points
            return BUCKET_POINTS[BUCKET_POINTS.length - 1];
        }

        int points = BUCKET_POINTS[bucketIndex];
        log.debug("[Scoring] elapsed={}ms → bucket={} → {}pts", elapsed, bucketIndex, points);
        return points;
    }

    /**
     * Apply points delta to an existing score map entry.
     *
     * @param currentScore existing cumulative score for the player
     * @param pointsToAdd  points awarded this round
     * @return new cumulative score
     */
    public int applyScore(int currentScore, int pointsToAdd) {
        return currentScore + pointsToAdd;
    }
}
