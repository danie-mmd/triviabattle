package za.co.triviabattle.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@Configuration
@EnableRedisRepositories(basePackages = "za.co.triviabattle.repository.redis")
public class RedisConfig {

    /**
     * Reactive Redis template that stores keys as Strings and values as JSON.
     * This is the primary template used by MatchmakingService and GameService.
     */
    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(
            ReactiveRedisConnectionFactory factory,
            ObjectMapper objectMapper) {

        var jsonSerializer = new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);
        var stringSerializer = new StringRedisSerializer();

        var context = RedisSerializationContext.<String, Object>newSerializationContext(stringSerializer)
                .value(jsonSerializer)
                .hashKey(stringSerializer)
                .hashValue(jsonSerializer)
                .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }
}
