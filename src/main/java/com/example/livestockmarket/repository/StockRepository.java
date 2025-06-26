package com.example.livestockmarket.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.livestockmarket.model.Stock;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {
    List<Stock> findBySymbol(String symbol);
}


