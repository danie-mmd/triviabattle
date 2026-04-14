# TriviaBattle: Run Commands Guide 🚀

This guide contains the commands needed to run the various components of the TriviaBattle monorepo.

## 🏃 Getting Started

### 1. Backend (Spring Boot)
The backend service handles game logic, authentication, and WebSockets. It runs on port **8080**.

```bash
cd apps/backend
./mvnw spring-boot:run
```

### 2. Frontend (React + Vite)
The frontend is the Telegram Mini App. It is configured to run on port **3000** (see `vite.config.ts`).

```bash
cd apps/frontend
npm run dev
```

### 3. Cloudflare Tunnel
To expose the frontend publicly for testing in Telegram, use `cloudflared`. This tunnel will point to the Vite dev server.

```bash
cloudflared tunnel --url http://localhost:3000
```
> [!NOTE]
> The frontend is configured to proxy `/api` and `/ws` requests to `http://localhost:8080`, so a single tunnel to the frontend port (3000) is sufficient for full functionality.

---

## 🛠️ Prerequisites (External Services)

The backend requires **MySQL** and **Redis** to be running locally.

### Redis
Runs on port **6379**.
```bash
docker run --name trivia-redis -p 6379:6379 -d redis
```

### MySQL
Runs on port **3306**.
```bash
docker run --name trivia-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=triviabattle -e MYSQL_USER=trivia -e MYSQL_PASSWORD=trivia_pass -d mysql:8
```
