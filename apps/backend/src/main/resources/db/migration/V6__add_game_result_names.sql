-- Migration: V6__add_game_result_names.sql
CREATE TABLE IF NOT EXISTS game_result_names (
    room_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (room_id, user_id),
    CONSTRAINT fk_game_result_names_room FOREIGN KEY (room_id) REFERENCES game_results(room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
