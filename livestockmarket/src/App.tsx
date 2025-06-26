// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import { useEffect, useState } from "react";

interface Stock {
  symbol: string;
  price: number;
  timestamp?: string;
}

const App = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);

  const fetchStocks = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/stocks");
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📈 Live Stock Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="bg-white rounded-2xl shadow p-4 border-l-4 border-blue-500 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-700">
              {stock.symbol}
            </h2>
            <p
              className={`text-xl font-bold ${
                stock.price > 100 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${stock.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              Updated:{" "}
              {stock.timestamp
                ? new Date(stock.timestamp).toLocaleTimeString()
                : "–"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

