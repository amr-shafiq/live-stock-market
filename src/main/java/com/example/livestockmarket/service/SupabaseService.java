package com.example.livestockmarket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;


@Service
public class SupabaseService {

    @Value("${supabase.url}/rest/v1/stock_market")
    private String supabaseApi;

    @Value("${supabase.apikey}")
    private String apiKey;

    public String getAllStocks() {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(supabaseApi))
                .header("apikey", apiKey)
                .header("Authorization", "Bearer " + apiKey)
                .header("Accept", "application/json")
                .GET()
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body(); // JSON string
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }
}
