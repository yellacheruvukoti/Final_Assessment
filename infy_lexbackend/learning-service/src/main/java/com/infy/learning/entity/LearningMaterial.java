package com.infy.learning.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "learning_materials", uniqueConstraints = {
        @UniqueConstraint(name = "uk_module_material_title", columnNames = { "module_id", "title" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "material_id", updatable = false, nullable = false, length = 36)
    private UUID materialId;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "module_id", nullable = false, length = 36)
    private UUID moduleId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "material_type", nullable = false, length = 20)
    private String materialType;

    @Column(name = "resource_path", nullable = false, length = 500)
    private String resourcePath;

    @Column(name = "access_level", nullable = false, length = 20)
    private String accessLevel;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
