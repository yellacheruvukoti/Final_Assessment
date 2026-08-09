package com.infy.user.mapper;

import com.infy.user.dto.AdministratorResponse;
import com.infy.user.entity.Administrator;

public final class AdministratorMapper {

    private AdministratorMapper() {
    }

    public static AdministratorResponse toResponse(Administrator administrator) {
        return AdministratorResponse.builder()
                .administratorId(administrator.getAdministratorId())
                .userId(administrator.getUserId())
                .adminCode(administrator.getAdminCode())
                .status(administrator.getStatus())
                .createdAt(administrator.getCreatedAt())
                .updatedAt(administrator.getUpdatedAt())
                .build();
    }
}
