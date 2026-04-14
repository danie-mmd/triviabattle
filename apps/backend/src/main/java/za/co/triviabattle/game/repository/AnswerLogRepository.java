package za.co.triviabattle.game.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.triviabattle.game.model.AnswerLog;

import java.util.Collection;
import java.util.Set;

public interface AnswerLogRepository extends JpaRepository<AnswerLog, Long> {
    
    @Query("SELECT DISTINCT al.questionId FROM AnswerLog al WHERE al.userId IN :userIds")
    Set<Long> findQuestionIdsByUserIdIn(@Param("userIds") Collection<Long> userIds);
}
