package za.co.triviabattle.game.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import za.co.triviabattle.game.model.Question;

import java.util.Collection;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    @Query(value = "SELECT * FROM questions WHERE active = 1 AND region = :region AND difficulty = :difficulty ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomByDifficultyAndRegionNative(@Param("difficulty") String difficulty, @Param("region") String region, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions WHERE active = 1 AND difficulty = :difficulty ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findAllRandomByDifficultyNative(@Param("difficulty") String difficulty, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions WHERE active = 1 AND difficulty = :difficulty AND id NOT IN :excludedIds ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomExcludingByDifficultyNative(@Param("difficulty") String difficulty, @Param("excludedIds") Collection<Long> excludedIds, @Param("limit") int limit);

    @Query(value = "SELECT * FROM questions WHERE active = 1 AND region = :region AND difficulty = :difficulty AND id NOT IN :excludedIds ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomExcludingByDifficultyAndRegionNative(@Param("difficulty") String difficulty, @Param("region") String region, @Param("excludedIds") Collection<Long> excludedIds, @Param("limit") int limit);

    org.springframework.data.domain.Page<Question> findByActiveTrue(org.springframework.data.domain.Pageable pageable);

    boolean existsByContentHash(String contentHash);
}
