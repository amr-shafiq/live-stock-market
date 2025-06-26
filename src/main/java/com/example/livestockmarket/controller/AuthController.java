package com.example.livestockmarket.controller;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.livestockmarket.dto.Login;
import com.example.livestockmarket.dto.AuthResponse;
import com.example.livestockmarket.repository.UserRepository;
import com.example.livestockmarket.repository.StockRepository;
import com.example.livestockmarket.model.User;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login request) {
        User user = userRepository.findByUsername(request.getUsername());
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = "jwt-token-here"; // Dummy for now
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
