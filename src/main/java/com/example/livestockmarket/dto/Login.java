package com.example.livestockmarket.dto;

import lombok.Data;

@Data
public class Login {
    private String username;
    private String password;

    public void getPassword(String password) {
        this.password = password;
    }
}
