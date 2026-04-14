package za.co.triviabattle.game.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Room – the central Redis-stored game state entity.
 *
 * Stored as JSON at key: "room:{roomId}"
 * TTL: 30 minutes (set by MatchmakingService).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room implements Serializable {

    private String roomId;
    private Long lobbyEndsAt;
    private boolean isCreditMatch;

    /** SQL Database ID for the tournament record */
    private Long databaseTournamentId;

    /** User IDs of the 5 players */
    @Builder.Default
    private List<String> playerIds = new ArrayList<>();

    /** userId → display name */
    @Builder.Default
    private Map<String, String> playerNames = new HashMap<>();

    private GameState state;

    /** Index into the question list (0–9) */
    @Builder.Default
    private int currentQuestionIndex = 0;

    /** userId → cumulative score */
    @Builder.Default
    private Map<String, Integer> scores = new HashMap<>();

    /** userId → has confirmed deposit */
    @Builder.Default
    private Map<String, Boolean> depositsConfirmed = new HashMap<>();

    /** userId → has answered this round */
    @Builder.Default
    private Map<String, Boolean> answeredThisRound = new HashMap<>();

    /** Epoch millis when the current question was pushed */
    private long questionStartedAt;

    /** Ordered list of question IDs for this game */
    @Builder.Default
    private List<Long> questionIds = new ArrayList<>();

    /** userId → double points active this round (cleared after each answer) */
    @Builder.Default
    private java.util.Set<String> doublePointsActive = new java.util.HashSet<>();

    /** TON prize pool (in nanoTON) */
    @Builder.Default
    private long prizePoolNano = 0L;

    /** ID of the winner (set at GAME_OVER) */
    private String winnerId;
}
