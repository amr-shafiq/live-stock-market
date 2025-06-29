const { Kafka } = require("kafkajs");
require("dotenv").config();
const fetch = require("node-fetch");

const kafka = new Kafka({
  clientId: "stock-producer",
  brokers: ["localhost:9092"]
});

const producer = kafka.producer();
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY; // 🔐 Replace with your actual key

// ✅ Monitor these popular stocks
const STOCK_SYMBOLS = ["AAPL", "TSLA", "MSFT", "GOOGL", "AMZN"];

const fetchStockPrice = async (symbol) => {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  }

  const data = await res.json();

  if (!data || typeof data.c !== "number") {
    throw new Error(`Invalid response from API for ${symbol}`);
  }

  return {
    price: data.c,
    change: data.d,
    changePercent: data.dp,
  };
};

const runProducer = async () => {
  try {
    await producer.connect();
  } catch (err) {
    console.error("❌ Kafka connect error. Retrying in 5s...");
    setTimeout(runProducer, 5000);
    return;
  }

  // Every 10 seconds, loop through all symbols and send their data
  setInterval(async () => {
    for (const symbol of STOCK_SYMBOLS) {
      try {
        const { price, change, changePercent } = await fetchStockPrice(symbol);

        const stockData = {
          symbol,
          price: parseFloat(price),
        change: parseFloat(change),
        changePercent: parseFloat(changePercent),
        timestamp: new Date().toISOString(),
        };

        await producer.send({
          topic: "stocks",
          messages: [{ value: JSON.stringify(stockData) }],
        });

        console.log(`[${new Date().toLocaleTimeString()}] ✅ Produced:`, stockData);
      } catch (err) {
        console.error(`❌ Error for ${symbol}:`, err.message);
      }
    }
  }, 2 * 60 * 1000); // Adjust as needed (2 minutes to handle API rate limits)
};

runProducer().catch(console.error);
