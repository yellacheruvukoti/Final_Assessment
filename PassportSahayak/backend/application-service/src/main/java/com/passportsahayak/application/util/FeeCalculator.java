package com.passportsahayak.application.util;

import com.passportsahayak.application.entity.ApplicationType;
import com.passportsahayak.application.entity.BookletType;
import com.passportsahayak.application.entity.ServiceScheme;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Fee schedule per KB-PASS-001 Section 4.2 (Effective April 2024).
 */
@Component
public class FeeCalculator {

    private static final BigDecimal TATKAL_SURCHARGE = BigDecimal.valueOf(2000);

    public BigDecimal calculate(ApplicationType type, ServiceScheme scheme, BookletType bookletType, boolean minor) {
        if (minor) {
            return scheme == ServiceScheme.TATKAL ? BigDecimal.valueOf(3000) : BigDecimal.valueOf(1000);
        }

        if (type == ApplicationType.REISSUE_LOST_DAMAGED) {
            BigDecimal base = bookletType == BookletType.JUMBO_60 ? BigDecimal.valueOf(3500) : BigDecimal.valueOf(3000);
            return scheme == ServiceScheme.TATKAL ? base.add(TATKAL_SURCHARGE) : base;
        }

        // FRESH, REISSUE_RENEWAL, REISSUE_NAME_CHANGE share the same normal/Tatkal schedule
        boolean jumbo = bookletType == BookletType.JUMBO_60;
        if (scheme == ServiceScheme.TATKAL) {
            return jumbo ? BigDecimal.valueOf(4000) : BigDecimal.valueOf(3500);
        }
        return jumbo ? BigDecimal.valueOf(2000) : BigDecimal.valueOf(1500);
    }
}
