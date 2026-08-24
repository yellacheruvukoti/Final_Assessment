package com.passportsahayak.kb.repository;

import com.passportsahayak.kb.entity.ChatInteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatInteractionLogRepository extends JpaRepository<ChatInteractionLog, Long> {
    List<ChatInteractionLog> findBySessionIdOrderByCreatedAtAsc(String sessionId);
}
