package com.infy.learning.client;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentInfo {
    private UUID assessmentId;
    private String status;
    private String scopeType;
    private UUID scopeId;
}
