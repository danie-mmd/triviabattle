# TriviaBattle 🧠⚡

A multiplayer real-time trivia Mini App for Telegram. 5 players compete for a TON prize pool with power-ups, sabotage mechanics, and AI-generated questions.

## Architecture

```
Telegram Client
    │
    ├── Frontend (React + Vite)          → Firebase Hosting
    │       └── TonConnect UI
    │
    └── Backend (Spring Boot + WebFlux)  → GCP Cloud Run
            ├── MySQL  (users, questions, history)
            ├── Redis  (matchmaking queue, game state)
            └── Gemini API (daily question generation)

Smart Contracts (Tact / TON)             → TON Blockchain
    └── Escrow.tact (entry fee + payout)
```

## Monorepo Structure

```
TriviaBattle/
├── apps/
│   ├── frontend/        # React + Vite + TypeScript (Telegram Mini App)
│   └── backend/         # Spring Boot 3 + WebFlux + Java 21
├── contracts/           # Tact smart contracts (Blueprint toolchain)
├── db/
│   └── init.sql         # Full MySQL DDL
└── package.json         # npm workspaces root
```

## Quick Start

### Prerequisites
- Node.js 18+
- Java 21
- Docker
- Redis (local or Docker)
- MySQL 8+

### 1. Clone & Install
```bash
git clone <repo>
cd TriviaBattle
cp .env.example .env  # fill in your secrets
npm install
```

### 2. Run Backend
```bash
cd apps/backend
./mvnw spring-boot:run
```

### 3. Run Frontend
```bash
cd apps/frontend
npm run dev
```

### 4. Build Smart Contracts
```bash
cd contracts
npm install
npx blueprint build
```

## Deployment

- **Frontend**: `npm run deploy:frontend` (Firebase Hosting)
- **Backend**: Build Docker image, push to GCP Artifact Registry, deploy to Cloud Run
- **Contracts**: `npx blueprint run` → TON testnet/mainnet

## Game Flow

1. Player opens Mini App → Wallet connects (TonConnect)
2. Player pays entry fee → Escrow smart contract
3. Matchmaking pools 5 players → Redis room created
4. 10 questions × 20s each via WebSocket
5. Time-Bucket scoring: answer speed determines points
6. Winner(s) receive TON payout from escrow
