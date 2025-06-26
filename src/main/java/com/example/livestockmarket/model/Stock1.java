package com.example.livestockmarket.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;


@Entity @Data
@Table(name = "stock_latest")
public class Stock1 {
    @Id
    private String symbol1;

    private BigDecimal price1;

    private Instant timestamp1;
}


