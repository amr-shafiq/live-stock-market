package com.example.livestockmarket.service;


import org.springframework.stereotype.Service;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.livestockmarket.model.Stock;
import com.example.livestockmarket.repository.StockRepository;
import com.fasterxml.jackson.databind.ObjectMapper;


@Service
public class StockConsumer {

    @Autowired
    private StockRepository stockRepository;

    @KafkaListener(topics = "stocks", groupId = "stock-group")
    public void listen(String message) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Stock stock = mapper.readValue(message, Stock.class);
            stockRepository.save(stock); // Upsert into PostgreSQL
            System.out.println("Consumed stock: " + stock);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

