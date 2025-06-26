package com.example.livestockmarket.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;


// Progress.java
@Entity
@Data 
public class Progress {
    @Id @GeneratedValue private Long id;
    @ManyToOne private User user;
    @ManyToOne private Word word;
    private boolean remembered;
    private LocalDate lastSeen;
}
