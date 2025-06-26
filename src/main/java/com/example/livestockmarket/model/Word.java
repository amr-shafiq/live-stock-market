package com.example.livestockmarket.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import jakarta.persistence.GeneratedValue;


@Entity @Data
public class Word {
    @Id @GeneratedValue private Long id;
    private String word;
    private String meaning;
    private String tag;
    private int level; // e.g., 1-5 for difficulty
}

