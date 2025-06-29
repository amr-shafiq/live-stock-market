const { Kafka } = require("kafkajs");
const fetch = require("node-fetch"); // install with: npm install node-fetch@2
require("dotenv").config();

const kafka = new Kafka({
  clientId: "stock-consumer",
  brokers: ["127.0.0.1:9092"]
});

const consumer = kafka.consumer({ groupId: "stock-group" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

const historyCache = {}; // 🧠 Caches last insert per symbol

// 🧠 Throttle inserts: if price change ≥ 0.1 or > 5 mins
const shouldInsertToHistory = (symbol, price) => {
  const now = Date.now();
  const last = historyCache[symbol];

  if (!last) return true;

  const priceDiff = Math.abs(price - last.price);
  const timeDiff = now - last.timestamp;

  return priceDiff >= 0.1 || timeDiff >= 1 * 60 * 1000; // 5 minutes or ±0.1 price
};

const runConsumer = async () => {
  try {
    await consumer.connect();
    console.log("✅ Connected to Kafka");

    await consumer.subscribe({ topic: "stocks", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const stock = JSON.parse(message.value.toString());
        console.log("Consumed:", stock);

        const payload = {
          symbol: stock.symbol,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change),
          changePercent: parseFloat(stock.changePercent),
          timestamp: stock.timestamp
        };

        // ✅ 1. Upsert to real-time table
        const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/stock_market`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates"
          },
          body: JSON.stringify([payload])
        });

        if (!upsertRes.ok) {
          const errText = await upsertRes.text();
          console.error("❌ Supabase Upsert Error:", upsertRes.status, errText);
        } else {
          console.log(`✅ ${stock.symbol} real-time price updated`);
        }

        // ✅ 2. Insert to historical table if needed
        if (shouldInsertToHistory(stock.symbol, payload.price)) {
          historyCache[stock.symbol] = {
            price: payload.price,
            change: payload.change,
            changePercent: payload.changePercent,
            timestamp: Date.now()
          };

          const historyRes = await fetch(`${SUPABASE_URL}/rest/v1/stock_history`, {
            method: "POST",
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify([{
              symbol: payload.symbol,
              price: payload.price,
              timestamp: payload.timestamp,
              change: payload.change,
            changePercent: payload.changePercent,
            }])
          });

          if (!historyRes.ok) {
            const errText = await historyRes.text();
            console.error("❌ Supabase History Error:", historyRes.status, errText);
          } else {
            console.log(`🕒 ${stock.symbol} price inserted to history`);
          }
        }
      }
    });
  } catch (err) {
    console.error("❌ Kafka Error:", err);
  }
};

runConsumer();