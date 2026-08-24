package com.passportsahayak.pv.util;

import java.time.DayOfWeek;
import java.time.LocalDate;

public final class WorkingDays {

    private WorkingDays() {
    }

    public static LocalDate plusWorkingDays(LocalDate from, int workingDays) {
        LocalDate cursor = from;
        int added = 0;
        while (added < workingDays) {
            cursor = cursor.plusDays(1);
            if (cursor.getDayOfWeek() != DayOfWeek.SATURDAY && cursor.getDayOfWeek() != DayOfWeek.SUNDAY) {
                added++;
            }
        }
        return cursor;
    }
}
