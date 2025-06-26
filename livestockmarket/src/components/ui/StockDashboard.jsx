import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

const StockDashboard = () => {
  const [stocks, setStocks] = useState({});

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws/prices");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      console.log("✅ Connected to WebSocket");

      stompClient.subscribe("/topic/price", (message) => {
        if (message.body) {
          const stockData = JSON.parse(message.body);

          // Update state with latest stock
          setStocks((prev) => ({
            ...prev,
            [stockData.symbol]: stockData
          }));
        }
      });
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("🛑 Disconnected");
        });
      }
    };
  }, []);

  return (
    <div className="p-4 font-mono">
      <h1 className="text-xl font-bold mb-4">📈 Live Stock Prices</h1>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Symbol</th>
            <th className="p-2">Price</th>
            <th className="p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(stocks).map((stock) => (
            <tr key={stock.symbol} className="border-t">
              <td className="p-2">{stock.symbol}</td>
              <td className="p-2">${stock.price}</td>
              <td className="p-2">{new Date(stock.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockDashboard;
