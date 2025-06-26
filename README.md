# Live Stock Market App

A real-time stock market visualization platform built with **Spring Boot**, **Apache Kafka**, **React**, and **Supabase**.

This project simulates a live stock tracking application, allowing users to monitor updates streamed through Kafka, consumed by a Spring Boot backend, and displayed on a React frontend.

---

## Tech Stack

### Frontend
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

### Backend
- [Java 18](https://www.oracle.com/java/technologies/javase/jdk18-archive-downloads.html)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Kafka](https://kafka.apache.org/)
- [Supabase REST API](https://supabase.com/)

### DevOps / Tooling
- **Gradle** – Java build system
- **.env Configuration** – Environment variable management
- **REST Template (Spring)** – For consuming Supabase API
- **Kafka Consumer Group** – `stock-group` handles updates
- **VS Code / IntelliJ IDEA** – IDEs used for dev

---

## Features

- ✅ Real-time stock price updates using Kafka
- ✅ REST API powered by Spring Boot
- ✅ Secure API requests using Supabase keys
- ✅ Responsive React frontend dashboard
- ✅ Auto-refreshing stock table
- ✅ Environment-safe config using `.env`

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/livestockmarket.git
cd livestockmarket

```
### 2. Start Kafka (Optional: for real-time simulation)

Make sure Apache Kafka is running locally:

```bash
# Install Kafka first and make sure npm/node.js is installed
npm install kafkajs

# Start Zookeeper
zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka server
kafka-server-start.sh config/server.properties

# Start the Kafka Producer and Consumer
node producer.js
node consumer.js
```

### 3. Run Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun
```

### 4. Run Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### 4. Application properties
```bash
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.datasource.url=jdbc:postgresql://db.iqhvgfkmvkhlpjhmayvn.supabase.co:5432/postgres
spring.datasource.username=postgresql
spring.datasource.password=StockMarketTrading
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
logging.level.root=DEBUG
supabase.url="The URL"
supabase.apikey="API_KEY"
finnhub.apikey="or any API Keys that can be used for showing stock market"

```

### Environment Variables
Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_API_KEY=your-anon-key
```

Inject in Spring Boot with:

```
@Value("${supabase.url}")
private String url;
```

### Future Plans
1. Add persistent storage for incoming Kafka messages
2. Add JWT-based authentication (Spring Security)
3. Add Kafka producer via dashboard controls
4. Add stock price charts using Chart.js or Recharts
