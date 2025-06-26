package com.example.livestockmarket.dto;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
public class AuthRequest {
    private String username;
    private String password;
}

// DTO = Data Transfer Object

/*  A design pattern used to transfer data between layers 
(especially between the backend and frontend, or between services) without exposing internal entity structures.

Decouple API from database model

1. Don't want to expose full database User or Stock entity directly to the frontend.

2. DTOs return only what’s necessary (e.g. exclude password fields).

Security

1. Prevent sensitive fields from leaking, like passwords or internal IDs.

Validation & Transformation

1. Can apply custom validation rules on incoming DTOs (@Valid, etc.).

2. Can reshape or combine data from multiple entities before sending to the frontend.       */