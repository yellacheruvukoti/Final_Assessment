package com.infy.summary.client;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Local mirror of the fields summary-service needs from user-service's
 * internal students-by-batch lookup (not a gateway-exposed route — see
 * api-contract.md Section 12, internal inter-service contracts).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRef {
    private UUID studentId;
}
