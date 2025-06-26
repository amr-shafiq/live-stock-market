package com.example.livestockmarket.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.livestockmarket.model.Progress;
import com.example.livestockmarket.repository.ProgressRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.RequiredArgsConstructor;

import com.example.livestockmarket.model.Progress;
import com.example.livestockmarket.repository.StockRepository;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;



@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressRepository progressRepository;

    @PostMapping
    public Progress saveProgress(@RequestBody Progress progress) {
        progress.setLastSeen(LocalDate.now());
        return progressRepository.save(progress);
    }
}

