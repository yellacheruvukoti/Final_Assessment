package com.infy.user.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.user.entity.Batch;

public interface BatchRepository extends JpaRepository<Batch, UUID> {

    Optional<Batch> findByBatchCode(String batchCode);

    List<Batch> findByOwnerId(UUID ownerId);
}
