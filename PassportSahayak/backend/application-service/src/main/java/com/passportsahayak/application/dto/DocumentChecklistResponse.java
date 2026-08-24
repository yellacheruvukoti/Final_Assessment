package com.passportsahayak.application.dto;

import com.passportsahayak.application.entity.ApplicationType;

import java.util.List;

public record DocumentChecklistResponse(
        ApplicationType applicationType,
        boolean minor,
        List<DocumentChecklistItem> documents,
        List<AnnexureInfo> applicableAnnexures
) {
}
