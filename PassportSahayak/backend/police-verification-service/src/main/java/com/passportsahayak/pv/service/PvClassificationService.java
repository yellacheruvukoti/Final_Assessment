package com.passportsahayak.pv.service;

import com.passportsahayak.pv.dto.ClassificationRule;
import com.passportsahayak.pv.dto.DispatchPvCaseRequest;
import com.passportsahayak.pv.entity.PvType;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Deterministic PV classification derived from KB-PASS-003 Section 2.1 decision table.
 * No AI/LLM involved.
 */
@Service
public class PvClassificationService {

    public PvType classify(DispatchPvCaseRequest req, String applicationType, boolean minor) {
        if (req.courtDirected()) {
            return PvType.EXPEDITED_PRE_PV;
        }
        if (req.governmentServant()) {
            return PvType.PV_EXEMPT;
        }
        if ("REISSUE_LOST_DAMAGED".equals(applicationType)) {
            return PvType.PRE_PV; // mandatory, KB-PASS-003 2.1
        }
        if ("FRESH".equals(applicationType)) {
            return minor ? PvType.POST_PV : PvType.PRE_PV;
        }
        // Renewal / name-change categories
        if (req.seniorCitizen()) {
            return PvType.POST_PV;
        }
        return req.addressChangedSinceLastPassport() ? PvType.PRE_PV : PvType.POST_PV;
    }

    public int slaWorkingDays(PvType pvType) {
        return pvType == PvType.EXPEDITED_PRE_PV ? 15 : 30;
    }

    public List<ClassificationRule> referenceTable() {
        return List.of(
                new ClassificationRule("Fresh application - adult", "PRE_PV", "After PV clearance received by RPO"),
                new ClassificationRule("Fresh application - minor", "POST_PV", "Dispatched within 3 days; PV within 30 days"),
                new ClassificationRule("Renewal - same address, no adverse record", "POST_PV", "Dispatched first; PV within 30 days"),
                new ClassificationRule("Renewal - address changed", "PRE_PV", "After PV clearance at new address"),
                new ClassificationRule("Lost passport re-issue", "PRE_PV", "After PV clearance (mandatory)"),
                new ClassificationRule("Government servant (Annexure F)", "PV_EXEMPT", "Dispatched without PV"),
                new ClassificationRule("Senior citizen (70+)", "POST_PV", "Dispatched first; PV within 30 days"),
                new ClassificationRule("Court-directed applicant", "EXPEDITED_PRE_PV", "15-day PV SLA applies")
        );
    }
}
