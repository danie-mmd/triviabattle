CREATE TABLE game_results (
    room_id VARCHAR(255) PRIMARY KEY,
    winner_id VARCHAR(255),
    prize_pool DOUBLE PRECISION NOT NULL
);

CREATE TABLE game_result_scores (
    room_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    PRIMARY KEY (room_id, user_id),
    CONSTRAINT fk_game_result_scores_room FOREIGN KEY (room_id) REFERENCES game_results(room_id)
);
