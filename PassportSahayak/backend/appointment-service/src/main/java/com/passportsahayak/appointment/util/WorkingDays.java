package com.passportsahayak.appointment.util;

import java.time.DayOfWeek;
import java.time.LocalDate;

public final class WorkingDays {

    private WorkingDays() {
    }

    /** Counts Mon-Fri days strictly between {@code from} (exclusive) and {@code to} (exclusive). */
    public static int between(LocalDate from, LocalDate to) {
        if (!to.isAfter(from)) {
            return 0;
        }
        int count = 0;
        LocalDate cursor = from.plusDays(1);
        while (cursor.isBefore(to)) {
            if (cursor.getDayOfWeek() != DayOfWeek.SATURDAY && cursor.getDayOfWeek() != DayOfWeek.SUNDAY) {
                count++;
            }
            cursor = cursor.plusDays(1);
        }
        return count;
    }
}
