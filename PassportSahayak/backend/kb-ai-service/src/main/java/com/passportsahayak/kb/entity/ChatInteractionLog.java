package com.passportsahayak.kb.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Session traceability record per SRS Sec 4.1.4: every conversation session has a UUID,
 * and every retrieval request + generated response is logged against it for audit.
 * The stored query is the PII-REDACTED version, never the raw user input.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "chat_interaction_log")
public class ChatInteractionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 36)
    private String sessionId;

    private Long actorUserId;

    @Column(length = 20)
    private String actorRole;

    @Lob
    @Column(nullable = false)
    private String redactedQuery;

    @Lob
    private String retrievedChunkRefs;

    @Lob
    private String answer;

    @Column(nullable = false)
    private boolean escalated;

    @Column(nullable = false)
    private boolean groundedInKb;

    @Column(length = 500)
    private String toolsInvoked;

    @Column(nullable = false)
    private Instant createdAt;
}
