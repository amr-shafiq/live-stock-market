const { Kafka } = require("kafkajs");
const fetch = require("node-fetch"); // install with: npm install node-fetch@2
require("dotenv").config();

const kafka = new Kafka({
  clientId: "stock-consumer",
  brokers: ["127.0.0.1:9092"]
});

const consumer = kafka.consumer({ groupId: "stock-group" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY; // 🔐 Replace with your actual anon key

const runConsumer = async () => {
  try {
    await consumer.connect();
    console.log("✅ Connected to Kafka");

    await consumer.subscribe({ topic: "stocks", fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const stock = JSON.parse(message.value.toString());
            console.log("Consumed:", stock);
          
            // 🔍 Add this to verify the body
            const payload = {
              symbol: stock.symbol,
              price: stock.price
            };
          
            console.log("📤 Sending to Supabase:", payload);
          
            const res = await fetch(`${SUPABASE_URL}/rest/v1/stock_market`, {
              method: "POST",
              headers: {
                "apikey": SUPABASE_API_KEY,
                "Authorization": `Bearer ${SUPABASE_API_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
              },
              body: JSON.stringify(payload)
            });
          
            if (!res.ok) {
              const errText = await res.text();
              console.error("❌ Supabase API Error:", res.status, errText);
            } else {
              console.log("✅ Stock saved to Supabase");
            }
          }
          
    });

  } catch (err) {
    console.error("❌ Error:", err);
  }
};

runConsumer();
