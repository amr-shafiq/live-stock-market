package com.example.livestockmarket.controller;

import com.example.livestockmarket.model.Stock;
import com.example.livestockmarket.repository.StockRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value; // ✅ ADD THIS
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
// import io.github.cdimascio.dotenv.Dotenv;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Allow React frontend
public class StockController {

    @Value("${supabase.url}/rest/v1/stock_market")
    private String supabaseApi;

    @Value("${supabase.apikey}")
    private String apiKey;


    @GetMapping("/stocks")
    public ResponseEntity<String> getStocks() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", apiKey);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("Content-Type", "application/json");
        headers.set("Prefer", "return=representation");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        RestTemplate rest = new RestTemplate();
        ResponseEntity<String> response = rest.exchange(supabaseApi, HttpMethod.GET, entity, String.class);

        return response;
    }
}


