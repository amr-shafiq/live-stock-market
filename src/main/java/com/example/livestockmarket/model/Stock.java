package com.example.livestockmarket.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;


@Entity
@Data
public class Stock {
    @Id
    private String symbol;

    private BigDecimal price;
    
    private BigDecimal change;

    private BigDecimal changePercent;

    private Instant timestamp;

    // Getters and setters
}

