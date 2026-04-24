package za.co.triviabattle.game.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import za.co.triviabattle.game.handler.GameWebSocketHandler;
import za.co.triviabattle.game.model.*;
import za.co.triviabattle.game.repository.*;
import za.co.triviabattle.payment.TonService;
import za.co.triviabattle.users.UserRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GameService {

    private final RoomService roomService;
    private final QuestionRepository questionRepository;
    private final GameResultRepository gameResultRepository;
    private final GameWebSocketHandler webSocketHandler;
    private final TonService tonService;
    private final TournamentRepository tournamentRepository;
    private final TournamentQuestionRepository tournamentQuestionRepository;
    private final TournamentPlayerRepository tournamentPlayerRepository;
    private final UserRepository userRepository;
    private final AnswerLogRepository answerLogRepository;

    public GameService(RoomService roomService,
                       QuestionRepository questionRepository,
                       GameResultRepository gameResultRepository,
                       @org.springframework.context.annotation.Lazy GameWebSocketHandler webSocketHandler,
                       TonService tonService,
                       TournamentRepository tournamentRepository,
                       TournamentQuestionRepository tournamentQuestionRepository,
                       TournamentPlayerRepository tournamentPlayerRepository,
                       UserRepository userRepository,
                       AnswerLogRepository answerLogRepository) {
        this.roomService = roomService;
        this.questionRepository = questionRepository;
        this.gameResultRepository = gameResultRepository;
        this.webSocketHandler = webSocketHandler;
        this.tonService = tonService;
        this.tournamentRepository = tournamentRepository;
        this.tournamentQuestionRepository = tournamentQuestionRepository;
        this.tournamentPlayerRepository = tournamentPlayerRepository;
        this.userRepository = userRepository;
        this.answerLogRepository = answerLogRepository;
    }

    @Value("${app.game.question-count:10}")
    private int questionCount;

    @Value("${app.game.question-time-seconds:20}")
    private int questionTime;

    @Value("${app.game.entry-fee-ton:1.0}")
    private double entryFee;

    @Value("${app.game.intermission-seconds:5}")
    private int intermissionTime;

    /** Starts a match by initializing questions and transitioning to the first question. */
    public Mono<Void> startMatch(Room room) {
        log.info("[GameService] Starting match for room: {}", room.getRoomId());

        List<Long> userIds = room.getPlayerIds().stream().map(Long::valueOf).collect(Collectors.toList());

        return Mono.fromCallable(() -> {
                    var answeredIds = answerLogRepository.findQuestionIdsByUserIdIn(userIds);
                    log.info("[GameService] StartMatch: players={}, answeredQuestionsCount={}", userIds, answeredIds.size());
                    
                    List<Question> questions = new ArrayList<>();
                    
                    // Difficulty Curve: 4 Easy, 4 Medium, 2 Hard
                    questions.addAll(fetchQuestionsForDifficulty("easy", 4, answeredIds));
                    questions.addAll(fetchQuestionsForDifficulty("medium", 4, answeredIds));
                    questions.addAll(fetchQuestionsForDifficulty("hard", 2, answeredIds));
                    
                    if (questions.size() < questionCount) {
                        log.warn("[GameService] Only found {}/{} difficulty questions. Filling up with randoms...", questions.size(), questionCount);
                        int remaining = questionCount - questions.size();
                        questions.addAll(questionRepository.findByActiveTrue(PageRequest.of(0, remaining)).getContent());
                    }

                    // Detailed logging for verification
                    String questionLog = questions.stream()
                        .map(q -> String.format("[%d: %s - %.30s...]", q.getId(), q.getDifficulty(), q.getQuestionText()))
                        .collect(Collectors.joining(", "));
                    log.info("[GameService] FINAL 4/4/2 Questions for room {}: {}", room.getRoomId(), questionLog);

                    return questions;
                })
                .doOnNext(questions -> {
                    log.info("[GameService] FINAL Fetched {} questions for room {}", questions.size(), room.getRoomId());
                    room.setQuestionIds(questions.stream().map(Question::getId).collect(Collectors.toList()));
                    
                    // Update Tournament record and save questions
                    if (room.getDatabaseTournamentId() != null) {
                        tournamentRepository.findById(room.getDatabaseTournamentId()).ifPresent(tournament -> {
                            tournament.setStartedAt(LocalDateTime.now());
                            tournament.setState(GameState.QUESTION_ACTIVE);
                            tournamentRepository.save(tournament);

                            List<TournamentQuestion> tqs = new ArrayList<>();
                            for (int i = 0; i < questions.size(); i++) {
                                TournamentQuestion tq = TournamentQuestion.builder()
                                        .id(new TournamentQuestionId(tournament.getId(), questions.get(i).getId()))
                                        .tournament(tournament)
                                        .question(questions.get(i))
                                        .questionOrder((byte)(i + 1))
                                        .build();
                                tqs.add(tq);
                            }
                            tournamentQuestionRepository.saveAll(tqs);
                        });
                    }
                })
                .flatMap(qs -> {
                    room.setCurrentQuestionIndex(0);
                    room.setState(GameState.QUESTION_ACTIVE);
                    return roomService.saveRoom(room)
                            .doOnSuccess(ok -> {
                                webSocketHandler.broadcastToRoom(room.getRoomId(),
                                        Map.of("type", "GAME_STATE", "state", "QUESTION_ACTIVE"));
                                // Start the actual game loop in background
                                sendNextQuestion(room.getRoomId()).subscribe();
                            });
                })
                .then();
    }

    private List<Question> fetchQuestionsForDifficulty(String difficulty, int count, java.util.Collection<Long> excludedIds) {
        log.info("[GameService] Fetching {} {} questions (50/50 SA/Global Mix)...", count, difficulty);
        List<Question> result = new ArrayList<>();
        
        int saToFetch = count / 2;
        int globalToFetch = count - saToFetch;

        // 1. Fetch South Africa questions
        List<Question> saQuestions = excludedIds.isEmpty() ?
                questionRepository.findRandomByDifficultyAndRegionNative(difficulty, "south_africa", saToFetch) :
                questionRepository.findRandomExcludingByDifficultyAndRegionNative(difficulty, "south_africa", excludedIds, saToFetch);
        result.addAll(saQuestions);
        
        // 2. Fetch Global questions
        List<Question> globalQuestions = excludedIds.isEmpty() ?
                questionRepository.findRandomByDifficultyAndRegionNative(difficulty, "global", globalToFetch) :
                questionRepository.findRandomExcludingByDifficultyAndRegionNative(difficulty, "global", excludedIds, globalToFetch);
        result.addAll(globalQuestions);
        
        // 3. Fallback: If not enough questions, fetch ANY active of this difficulty (ignoring region/exclusion)
        if (result.size() < count) {
            log.warn("[GameService] Insufficient 50/50 {} questions. Fallback ignoring constraints...", difficulty);
            int remaining = count - result.size();
            result.addAll(questionRepository.findAllRandomByDifficultyNative(difficulty, remaining));
        }
        
        return result;
    }

    private Mono<Void> sendNextQuestion(String roomId) {
        return roomService.getRoom(roomId)
                .flatMap(room -> {
                    if (room.getCurrentQuestionIndex() >= room.getQuestionIds().size()) {
                        return endGame(room);
                    }

                    Long questionId = room.getQuestionIds().get(room.getCurrentQuestionIndex());
                    return Mono.fromCallable(() -> questionRepository.findById(questionId))
                            .flatMap(opt -> Mono.justOrEmpty(opt))
                            .flatMap(question -> {
                                room.setState(GameState.QUESTION_ACTIVE);
                                room.setQuestionStartedAt(System.currentTimeMillis());
                                room.getAnsweredThisRound().clear();

                                // Broadcast question to WebSocket
                                webSocketHandler.broadcastToRoom(roomId, Map.of(
                                        "type", "QUESTION",
                                        "question", Map.of(
                                            "id", question.getId(),
                                            "text", question.getQuestionText(),
                                            "options", List.of(question.getOptionA(), question.getOptionB(), question.getOptionC(), question.getOptionD()),
                                            "timeLimit", questionTime,
                                            "index", room.getCurrentQuestionIndex() + 1,
                                            "total", room.getQuestionIds().size()
                                        )
                                ));

                                return roomService.saveRoom(room)
                                        .doOnSuccess(ok -> {
                                            // Run timer in background
                                            Mono.delay(Duration.ofSeconds(questionTime))
                                                .flatMap(d -> endRound(roomId))
                                                .subscribe();
                                        })
                                        .then();
                            });
                }).then();
    }

    private Mono<Void> endRound(String roomId) {
        return roomService.getRoom(roomId)
                .flatMap(room -> {
                    room.setState(GameState.INTERMISSION);
                    
                    // Get correct answer for the question just finished
                    Long lastQid = room.getQuestionIds().get(room.getCurrentQuestionIndex());
                    return Mono.fromCallable(() -> questionRepository.findById(lastQid))
                        .flatMap(opt -> Mono.justOrEmpty(opt))
                        .flatMap(question -> {
                            webSocketHandler.broadcastToRoom(roomId, Map.of(
                                    "type", "INTERMISSION",
                                    "correctIndex", question.getCorrectIndex(),
                                    "scores", room.getScores()
                            ));

                            room.setCurrentQuestionIndex(room.getCurrentQuestionIndex() + 1);
                            return roomService.saveRoom(room)
                                    .doOnSuccess(ok -> {
                                        // Wait for transition to next question in background
                                        Mono.delay(Duration.ofSeconds(intermissionTime))
                                            .then(sendNextQuestion(roomId))
                                            .subscribe();
                                    });
                        });
                })
                .then();
    }

    private Mono<Void> endGame(Room room) {
        log.info("[Game] Ending match in room {}", room.getRoomId());
        
        room.setState(GameState.GAME_OVER);
        
        // Calculate winner
        String winnerId = room.getScores().entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        double totalPool = room.getPlayerIds().size() * entryFee;
        double winnerPrize = totalPool * 0.8; // 80/20 split (Winner gets 80%)

        // Update SQL Tournament record
        if (room.getDatabaseTournamentId() != null) {
            tournamentRepository.findById(room.getDatabaseTournamentId()).ifPresent(t -> {
                t.setState(GameState.GAME_OVER);
                t.setEndedAt(LocalDateTime.now());
                t.setPrizePoolNano((long)(winnerPrize * 1_000_000_000L));
                if (winnerId != null) {
                    userRepository.findById(Long.valueOf(winnerId)).ifPresent(t::setWinner);
                }
                tournamentRepository.save(t);

                // Save TournamentPlayer results
                List<Map.Entry<String, Integer>> sorted = room.getScores().entrySet().stream()
                        .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                        .toList();

                List<TournamentPlayer> tps = new ArrayList<>();
                for (int i = 0; i < sorted.size(); i++) {
                    final byte rank = (byte) (i + 1);
                    String uid = sorted.get(i).getKey();
                    int score = sorted.get(i).getValue();
                    Long numericUid = Long.valueOf(uid);
                    
                    userRepository.findById(numericUid).ifPresent(user -> {
                        TournamentPlayer tp = TournamentPlayer.builder()
                                .id(new TournamentPlayerId(t.getId(), numericUid))
                                .tournament(t)
                                .user(user)
                                .finalScore(score)
                                .playerRank(rank)
                                .tonPayoutNano(uid.equals(winnerId) ? t.getPrizePoolNano() : 0)
                                .paid(uid.equals(winnerId)) // Implementation pending real on-chain check
                                .build();
                        tps.add(tp);
                    });
                }
                tournamentPlayerRepository.saveAll(tps);
            });
        }

        GameResult result = GameResult.builder()
                .roomId(room.getRoomId())
                .winnerId(winnerId)
                .scores(room.getScores())
                .playerNames(room.getPlayerNames())
                .prizePool(winnerPrize)
                .isCreditMatch(room.isCreditMatch())
                .build();

        Mono<Void> processPayout = Mono.empty();
        if (room.isCreditMatch() && winnerId != null) {
            // In credit match, if entry is 1 Credit, prize is roomSize * 0.8
            int roomSize = room.getPlayerIds().size();
            int creditPrize = (int) Math.round(roomSize * 0.8);
            log.info("[CreditMatch] AWARDING: winner {} gets {} credits (RoomSize={})", winnerId, creditPrize, roomSize);
            
            processPayout = Mono.fromCallable(() -> userRepository.findById(Long.valueOf(winnerId)))
                .flatMap(opt -> Mono.justOrEmpty(opt))
                .flatMap(user -> {
                    int current = (user.getCredits() != null ? user.getCredits() : 0);
                    user.setCredits(current + creditPrize);
                    log.info("[CreditMatch] SUCCESS: user {} credits ({} -> {})", winnerId, current, user.getCredits());
                    return Mono.fromCallable(() -> {
                        userRepository.saveAndFlush(user);
                        return user;
                    }).then();
                });
        } else if (winnerId != null) {
            double serviceFee = totalPool * 0.2;
            
            log.info("[Payout] Triggering TON payout for room {}: winner {} gets {} TON, fee {} TON", 
                    room.getRoomId(), winnerId, winnerPrize, serviceFee);
            processPayout = tonService.payoutToWinner(room.getRoomId(), winnerId, winnerPrize, serviceFee)
                    .then(Mono.delay(Duration.ofSeconds(60)))
                    .doOnSuccess(v -> tonService.withdrawDust())
                    .then();
        } else {
            log.warn("[Game] No winner for room {}. Skipping payout.", room.getRoomId());
        }

        // Cleanup: Clear user-to-room mappings so players can join new games
        Mono<Void> cleanupMappings = Flux.fromIterable(room.getPlayerIds())
                .flatMap(roomService::clearUserRoomMapping)
                .then();

        return Mono.fromCallable(() -> gameResultRepository.save(result))
                .then(roomService.saveRoom(room))
                .then(Mono.fromRunnable(() -> {
                    webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                            "type", "GAME_OVER",
                            "winnerId", winnerId != null ? winnerId : "None",
                            "scores", room.getScores()
                    ));
                }))
                .then(cleanupMappings)
                .then(processPayout);
    }
    public Mono<Void> refundPlayerCredit(String userId, boolean isCreditMatch) {
        if (!isCreditMatch) return Mono.empty();
        return Mono.fromCallable(() -> userRepository.findById(Long.valueOf(userId)))
                .flatMap(opt -> Mono.justOrEmpty(opt))
                .flatMap(user -> {
                    int current = user.getCredits() != null ? user.getCredits() : 0;
                    user.setCredits(current + 1);
                    log.info("[GameService] Refunded 1 credit to user {}. New balance: {}", userId, user.getCredits());
                    return Mono.fromCallable(() -> {
                        userRepository.saveAndFlush(user);
                        return user;
                    }).then();
                });
    }

    public Mono<Void> refundLobby(Room room) {
        log.info("[Game] Refund triggered for room {} (solo player: {})", room.getRoomId(), room.getPlayerIds());
        
        // Notify the player
        webSocketHandler.broadcastToRoom(room.getRoomId(), Map.of(
                "type", "LOBBY_REFUNDED",
                "message", room.isCreditMatch() ? 
                        "Not enough players. Your 1 Credit has been refunded." : 
                        String.format("Not enough players. Your %.2f TON has been refunded.", entryFee),
                "roomId", room.getRoomId()
        ));

        // Cleanup: Clear user-to-room mappings
        Mono<Void> cleanup = Flux.fromIterable(room.getPlayerIds())
                .flatMap(uid -> {
                    log.info("[Refund] Clearing mapping for {}", uid);
                    return roomService.clearUserRoomMapping(uid).then(refundPlayerCredit(uid, room.isCreditMatch()));
                })
                .then();

        if (!room.isCreditMatch()) {
            log.info("[Refund] Triggering TON refund for room {}", room.getRoomId());
            return tonService.refundPrizePool(room.getRoomId()).then(cleanup);
        }

        return cleanup;
    }
}

