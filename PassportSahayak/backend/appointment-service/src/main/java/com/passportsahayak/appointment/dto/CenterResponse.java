package com.passportsahayak.appointment.dto;

import com.passportsahayak.appointment.entity.CenterType;
import com.passportsahayak.appointment.entity.PskCenter;

public record CenterResponse(
        Long id,
        String code,
        String name,
        CenterType type,
        String city,
        String state,
        String address,
        Integer dailyCapacity,
        Integer tatkalCapacityPercent
) {
    public static CenterResponse from(PskCenter c) {
        return new CenterResponse(c.getId(), c.getCode(), c.getName(), c.getType(), c.getCity(), c.getState(),
                c.getAddress(), c.getDailyCapacity(), c.getTatkalCapacityPercent());
    }
}
