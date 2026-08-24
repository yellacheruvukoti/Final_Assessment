package com.passportsahayak.appointment.config;

import com.passportsahayak.appointment.entity.CenterType;
import com.passportsahayak.appointment.entity.PskCenter;
import com.passportsahayak.appointment.repository.PskCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PskCenterRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        repository.saveAll(java.util.List.of(
                center("PSK-BLR-01", "PSK Bengaluru - Koramangala", CenterType.PSK, "Bengaluru", "Karnataka",
                        "80 Feet Road, Koramangala 4th Block, Bengaluru 560034", 150),
                center("PSK-BLR-02", "PSK Bengaluru - Whitefield", CenterType.PSK, "Bengaluru", "Karnataka",
                        "ITPL Main Road, Whitefield, Bengaluru 560066", 120),
                center("PSK-MUM-01", "PSK Mumbai - Worli", CenterType.PSK, "Mumbai", "Maharashtra",
                        "Century Bazar, Worli, Mumbai 400025", 180),
                center("PSK-DEL-01", "PSK Delhi - Dwarka", CenterType.PSK, "New Delhi", "Delhi",
                        "Sector 10, Dwarka, New Delhi 110075", 200),
                center("PSK-CHN-01", "PSK Chennai - Anna Nagar", CenterType.PSK, "Chennai", "Tamil Nadu",
                        "2nd Avenue, Anna Nagar, Chennai 600040", 140),
                center("POPSK-MYS-01", "POPSK Mysuru Head Post Office", CenterType.POPSK, "Mysuru", "Karnataka",
                        "Ashoka Road, Mysuru 570001", 40),
                center("POPSK-PUN-01", "POPSK Pune Camp Post Office", CenterType.POPSK, "Pune", "Maharashtra",
                        "MG Road, Pune Camp, Pune 411001", 35)
        ));
    }

    private PskCenter center(String code, String name, CenterType type, String city, String state, String address, int dailyCapacity) {
        return PskCenter.builder()
                .code(code)
                .name(name)
                .type(type)
                .city(city)
                .state(state)
                .address(address)
                .dailyCapacity(dailyCapacity)
                .tatkalCapacityPercent(12)
                .active(true)
                .build();
    }
}
