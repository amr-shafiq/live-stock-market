package com.example.livestockmarket.model;

import jakarta.persistence.*;
import lombok.Data;

import lombok.Getter;
import lombok.Setter;


@Entity @Data
@Getter
@Setter
public class User {
    @Id @GeneratedValue private Long id;
    private String username;
    private String password;
    private String role; // "USER", "ADMIN"
}
