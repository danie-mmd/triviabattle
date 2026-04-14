package za.co.triviabattle.game.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import za.co.triviabattle.game.model.Room;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private static final String ROOM_KEY_PREFIX = "room:";
    private static final Duration ROOM_TTL      = Duration.ofMinutes(30);

    private final ReactiveRedisTemplate<String, Object> redis;
    private final ObjectMapper objectMapper;

    public Mono<Room> getRoom(String roomId) {
        return redis.opsForValue()
                .get(ROOM_KEY_PREFIX + roomId)
                .map(obj -> objectMapper.convertValue(obj, Room.class));
    }

    public Mono<Boolean> saveRoom(Room room) {
        return redis.opsForValue()
                .set(ROOM_KEY_PREFIX + room.getRoomId(), room, ROOM_TTL);
    }

    public Mono<Long> clearUserRoomMapping(String userId) {
        log.info("[RoomService] Clearing room mapping for user {}", userId);
        return redis.delete("user:room:" + userId);
    }
}
