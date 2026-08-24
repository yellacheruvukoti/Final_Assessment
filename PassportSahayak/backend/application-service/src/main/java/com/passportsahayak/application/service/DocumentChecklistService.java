package com.passportsahayak.application.service;

import com.passportsahayak.application.dto.AnnexureInfo;
import com.passportsahayak.application.dto.DocumentChecklistItem;
import com.passportsahayak.application.dto.DocumentChecklistResponse;
import com.passportsahayak.application.entity.ApplicationType;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Static, rule-based document checklist derived from KB-PASS-002
 * (Document Checklist & Annexures). No AI/LLM involved.
 */
@Service
public class DocumentChecklistService {

    public DocumentChecklistResponse getChecklist(ApplicationType type, boolean minor) {
        List<DocumentChecklistItem> documents;
        List<AnnexureInfo> annexures;

        if (minor) {
            documents = List.of(
                    new DocumentChecklistItem("Minor's Birth Certificate (Municipal Corporation)", true, null),
                    new DocumentChecklistItem("Proof of Address (minor's address; parent's Aadhaar accepted)", true, null),
                    new DocumentChecklistItem("Parent's / Guardian's passport copy (first and last page)", true, null),
                    new DocumentChecklistItem("Aadhaar Card of Minor", false, "Recommended if available"),
                    new DocumentChecklistItem("2 recent passport-size colour photographs", true, null)
            );
            annexures = List.of(
                    new AnnexureInfo("C", "Declaration by parent (single parent present at PSK)", "One parent absent during minor's PSK visit"),
                    new AnnexureInfo("D", "Declaration by non-attending parent", "Second parent not accompanying minor to PSK"),
                    new AnnexureInfo("H", "Affidavit - single parenthood", "Applicant is a single parent"),
                    new AnnexureInfo("I", "Declaration of place of birth and parentage", "Birth certificate not available")
            );
            return new DocumentChecklistResponse(type, true, documents, annexures);
        }

        switch (type) {
            case FRESH -> {
                documents = List.of(
                        new DocumentChecklistItem("Proof of Date of Birth", true, "Birth certificate / 10th marksheet / Aadhaar / Voter ID"),
                        new DocumentChecklistItem("Proof of Identity", true, "Aadhaar / PAN / Voter ID / Driving licence"),
                        new DocumentChecklistItem("Proof of Address", true, "Aadhaar / Voter ID / utility bill (<3 months) / bank passbook"),
                        new DocumentChecklistItem("Old passport, if any (even if expired)", false, "Mandatory if previously held"),
                        new DocumentChecklistItem("2 recent passport-size colour photographs", true, "White background")
                );
                annexures = List.of(
                        new AnnexureInfo("B", "Affidavit - date of birth", "DOB discrepancy or correction"),
                        new AnnexureInfo("A", "Affidavit for change of name", "Legal name change without gazette notification")
                );
            }
            case REISSUE_RENEWAL -> {
                documents = List.of(
                        new DocumentChecklistItem("Original old passport (to be surrendered)", true, null),
                        new DocumentChecklistItem("Proof of Address", false, "Mandatory only if address changed since last passport"),
                        new DocumentChecklistItem("Proof of Identity", true, "Consistent with current passport data"),
                        new DocumentChecklistItem("2 recent passport-size colour photographs", true, null),
                        new DocumentChecklistItem("Aadhaar Card", false, "Strongly recommended")
                );
                annexures = List.of();
            }
            case REISSUE_LOST_DAMAGED -> {
                documents = List.of(
                        new DocumentChecklistItem("FIR copy from jurisdictional police station", true, "Mandatory for lost passport"),
                        new DocumentChecklistItem("Notarised affidavit explaining circumstances of loss/damage", true, null),
                        new DocumentChecklistItem("Original damaged passport", false, "Mandatory for damaged (not lost) passport"),
                        new DocumentChecklistItem("Proof of Date of Birth", true, null),
                        new DocumentChecklistItem("Proof of Identity", true, null),
                        new DocumentChecklistItem("Proof of Address", true, null),
                        new DocumentChecklistItem("2 recent passport-size colour photographs", true, null)
                );
                annexures = List.of();
            }
            case REISSUE_NAME_CHANGE -> {
                documents = List.of(
                        new DocumentChecklistItem("Original registered marriage certificate", false, "For marriage-related name/spouse change"),
                        new DocumentChecklistItem("Gazette of India notification (Central/State)", false, "For legal name change"),
                        new DocumentChecklistItem("Original divorce decree from a competent court", false, "For spouse name removal"),
                        new DocumentChecklistItem("Affidavit + 2 supporting documents", true, "Showing the correct/consistent name"),
                        new DocumentChecklistItem("2 recent passport-size colour photographs", true, null)
                );
                annexures = List.of(
                        new AnnexureInfo("E", "Declaration for Tatkal passport (general cases)", "Tatkal applications without a specific urgency document"),
                        new AnnexureInfo("A", "Affidavit for change of name", "Legal name change without gazette notification")
                );
            }
            default -> {
                documents = List.of();
                annexures = List.of();
            }
        }

        return new DocumentChecklistResponse(type, false, documents, annexures);
    }
}
