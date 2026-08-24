package com.passportsahayak.appointment.controller;

import com.passportsahayak.appointment.dto.CenterResponse;
import com.passportsahayak.appointment.service.CenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/centers")
@RequiredArgsConstructor
public class CenterController {

    private final CenterService centerService;

    @GetMapping
    public ResponseEntity<List<CenterResponse>> list() {
        return ResponseEntity.ok(centerService.listActive());
    }
}
