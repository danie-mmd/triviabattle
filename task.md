# Telegram Trivia Game - Task Tracker

## Phase 1: The Foundation (Scaffolding)
- [/] Mission 1.1 – Project Setup: Scaffold monorepo (React+Vite frontend, Spring Boot backend, Dockerfile, Firebase config)
- [ ] Mission 1.2 – Telegram SDK Integration: `telegram-web-app.js` SDK, mock login, `initData` → Java backend
- [ ] Mission 1.3 – Auth Security: Java HMAC validator using `BOT_TOKEN` env var

## Phase 2: The Core Game Loop (Real-time)
- [ ] Mission 2.1 – The Room Manager: Redis `Room` entity, matchmaking service (5-player pool)
- [ ] Mission 2.2 – WebSocket Orchestrator: Game state machine (WAITING → QUESTION_ACTIVE → INTERMISSION → GAME_OVER)
- [ ] Mission 2.3 – The Scoring Brain: Time-Bucket scoring (500ms intervals)

## Phase 3: The Economic Layer (Prize Pool)
- [/] Mission 3.1 – Smart Contract: Tact contract (entry fee escrow + backend-authorized payout)

- [ ] Mission 3.2 – Payment Flow: Telegram Stars API + TonConnect UI
- [x] Mission 3.3 – Payout Microservice: Node.js Express service using standard TON SDK (@ton/ton) for robust payout execution.


## Phase 4: The "Unfair Advantage" (UI & AI)
- [ ] Mission 4.1 – Sabotage UI: React power-up components (Ink Blot overlay, WebSocket events)
- [ ] Mission 4.2 – AI Question Pipeline: Cloud Scheduler + Gemini API for daily SA/global trivia
