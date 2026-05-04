# Telegram Trivia Game – Monorepo Implementation Plan

A multiplayer trivia Mini App for Telegram where 5 players compete in real-time, pay entry fees in TON, and win from a prize pool. Built as a monorepo with a React+Vite frontend and Java Spring Boot backend.

## User Review Required

> [!IMPORTANT]
> **Smart Contract / Wallet Interactions**: Tact is a new language for the TON ecosystem. The generated smart contract will be a working skeleton but will need audit before mainnet deployment. TON testnet is recommended for initial testing.

> [!IMPORTANT]
> **Environment Variables Required**: Several secrets are needed to run the app locally. See the `.env.example` files generated in each service. You will need: `BOT_TOKEN`, `REDIS_URL`, `MYSQL_URL`, `GEMINI_API_KEY`, `TON_WALLET_ADDRESS`.

> [!WARNING]
> **GCP & Firebase Setup**: The Dockerfile and `firebase.json` will be scaffolded but GCP Cloud Run and Firebase Hosting require manual project creation and IAM setup before deployment.

---

## Environment Separation

### [NEW] [.env.test](file:///home/danie/Development/Projects/Antigravity/TriviaBattle/.env.test)
- Contains all testnet credentials, local database settings, and test bot tokens.

### [NEW] [.env.prod](file:///home/danie/Development/Projects/Antigravity/TriviaBattle/.env.prod)
- Contains mainnet credentials, production database settings, and the production bot token.
- Includes the new production wallet information.

### [NEW] [application-prod.yml](file:///home/danie/Development/Projects/Antigravity/TriviaBattle/apps/backend/src/main/resources/application-prod.yml)
- Specific Spring Boot configuration for production (SSL for Redis, restricted logging).

### [NEW] [application-test.yml](file:///home/danie/Development/Projects/Antigravity/TriviaBattle/apps/backend/src/main/resources/application-test.yml)
- Spring Boot configuration for testnet/local dev.

---

## Proposed Changes

### Phase 1: Foundation (Scaffolding)

#### [NEW] Monorepo Root
- `package.json` (root workspaces)
- `.gitignore`
- `README.md`

---

#### Frontend – `apps/frontend/`

#### [NEW] [Vite + React + TypeScript App](file:///home/danie/.gemini/antigravity/playground/white-oort/apps/frontend)
- Bootstrapped with `create-vite` using the `react-ts` template
- `src/hooks/useTelegram.ts` – wraps `window.Telegram.WebApp`, exposes `user`, `initData`, `showAlert`, etc.
- `src/services/api.ts` – Axios client that attaches `initData` as a Bearer token header on every request
- `src/pages/LoginPage.tsx` – extracts `initData` and POSTs to `/api/auth/login`
- `public/index.html` – injects `telegram-web-app.js` script tag
- `firebase.json` + `.firebaserc` – Firebase Hosting config pointing to `dist/`

---

#### Backend – `apps/backend/`

#### [NEW] Spring Boot App](file:///home/danie/.gemini/antigravity/playground/white-oort/apps/backend)
- Maven multi-module project (`pom.xml`)
- **Dependencies**: Spring WebFlux, Spring Data Redis (Reactive), Spring Data JPA (MySQL), Spring Security, Lombok, Gson, `okhttp3`

#### [NEW] `src/main/java/.../auth/TelegramAuthUtils.java`
- `validateInitData(String initData, String botToken): boolean` – HMAC-SHA256 validation per the Telegram spec
- `parseUser(String initData): TelegramUser` – extracts user fields

#### [NEW] `src/main/java/.../auth/AuthController.java`
- `POST /api/auth/login` – validates `initData`, issues a signed JWT (or session token), returns user profile

#### [NEW] `src/main/java/.../config/RedisConfig.java`
- Reactive `ReactiveRedisTemplate<String, Object>` bean

#### [NEW] `src/main/java/.../config/WebSocketConfig.java`
- Registers the WebSocket handler at `/ws/game`

#### [NEW] `Dockerfile`
- Multi-stage build: Maven build → JRE 21 slim image
- Exposes port `8080`, designed for Cloud Run (`PORT` env var)

#### [NEW] `src/main/resources/application.yml`
- Profiles: `local`, `prod`
- Reads `MYSQL_URL`, `REDIS_URL`, `BOT_TOKEN`, `JWT_SECRET` from env

---

### Phase 2: Core Game Loop

#### [NEW] `src/main/java/.../game/model/Room.java`
- Redis-serializable POJO: `roomId`, `players: List<String>`, `state: GameState`, `currentQuestion`, `scores: Map<String,Integer>`, `ttl`
- Stored in Redis as JSON with a 30-minute TTL

#### [NEW] `src/main/java/.../game/service/MatchmakingService.java`
- `joinQueue(String userId)` – adds user to a Redis sorted set `queue`
- `tryFormRoom()` – scheduled every 2s; pops 5 users, creates a `Room`, broadcasts `ROOM_CREATED` via WebSocket
- `leaveQueue(String userId)` – removes user

#### [NEW] `src/main/java/.../game/service/GameService.java`
- Manages state transitions: `WAITING → QUESTION_ACTIVE → INTERMISSION → GAME_OVER`
- Picks questions from MySQL `questions` table
- Pushes state updates to all room members via `SimpMessagingTemplate` / reactive WebSocket

#### [NEW] `src/main/java/.../game/handler/GameWebSocketHandler.java`
- Reactive WebSocket handler (Spring WebFlux)
- Routes incoming messages: `JOIN_ROOM`, `SUBMIT_ANSWER`, `USE_POWERUP`, `SABOTAGE`
- Broadcasts: `GAME_STATE`, `QUESTION`, `SCORE_UPDATE`, `SABOTAGE_EVENT`, `GAME_OVER`

#### [NEW] `src/main/java/.../game/service/ScoringService.java`
- **Time-Bucket Logic**: Answer arrives with server-recorded `questionStartTime`
  - 0–500ms → 1000 pts
  - 500–1000ms → 800 pts
  - 1000–1500ms → 600 pts
  - 1500–2000ms → 400 pts
  - 2000ms+ → 200 pts (if correct)
  - Wrong answer → 0 pts

---

### Phase 3: Economic Layer

#### [NEW] `contracts/escrow.tact`
- Tact smart contract:
  - `receive("deposit")` – accepts TON entry fee, records `sender`, increments `prizePool`
  - `receive("payout")` – only callable by `authorizedBackend` address; splits pool among winners
  - `receive("refund")` – refunds all if game cancelled
  - Getter: `getPrizePool(): Int`

#### [NEW] Frontend: `src/components/WalletConnect.tsx`
- Integrates `@tonconnect/ui-react`
- Shows connected wallet address or "Connect Wallet" button
- Triggers `tonConnectUI.sendTransaction(...)` for entry fee

#### [NEW] Frontend: `src/components/StarsPurchase.tsx`
- Uses `window.Telegram.WebApp.openInvoice(...)` for Telegram Stars
- Calls backend `/api/payments/stars/invoice` to get invoice link

#### [NEW] Backend: `src/main/java/.../payment/PaymentController.java`
- `POST /api/payments/stars/invoice` – creates an invoice via Telegram Bot API (`createInvoiceLink`)
- `POST /api/payments/stars/webhook` – handles `pre_checkout_query` + `successful_payment` updates

#### [NEW] Payout Microservice – `apps/ton-payout/`
- Node.js + Express + TypeScript microservice.
- Integrates `@ton/ton` and `@ton/crypto` for secure transaction signing and building BoCs.
- Exposes internal HTTP POST endpoints for the Java backend to trigger prize payouts.
- Reads `TON_WALLET_MNEMONIC` or private key securely from environment variables.

#### [MODIFY] Backend: `src/main/java/.../payment/TonService.java`
- Update `payoutToWinner` to make an internal HTTP request to the new Node.js microservice (`apps/ton-payout`) instead of handling direct blockchain interaction via Java.

---

### Phase 4: UI & AI

#### [NEW] Frontend: `src/components/game/PowerUpBar.tsx`
- Displays available power-ups (Ink Blot, Freeze, Double Points)
- On use → sends `USE_POWERUP` WebSocket message

#### [NEW] Frontend: `src/components/game/InkBlotOverlay.tsx`
- Triggered by `SABOTAGE_EVENT` with `type: "INK_BLOT"` from server
- CSS animation overlays a random ink-blot SVG for 5 seconds

#### [NEW] Frontend: `src/components/game/QuestionCard.tsx`
- Displays question + 4 answer options
- Submit triggers timer (shown as shrinking progress bar)
- Sends `SUBMIT_ANSWER` to WebSocket

#### [NEW] Backend: `src/main/java/.../ai/QuestionGeneratorJob.java`
- `@Scheduled` task (or triggered via Cloud Scheduler HTTP endpoint)
- Calls Gemini API with prompt: *"Generate 10 South Africa and global trivia questions from today's trending news. Return JSON: [{question, options: [], correctIndex, category, difficulty}]"*
- Parses response, deduplicates by question hash, inserts into MySQL `questions` table

---

## Verification Plan

### Automated Tests

```bash
# Backend unit tests (Maven)
cd apps/backend
./mvnw test
```
- `TelegramAuthUtilsTest` – tests HMAC validation with known good/bad `initData` strings
- `ScoringServiceTest` – tests time bucket boundaries
- `MatchmakingServiceTest` – tests room formation with Redis mock

### Manual Verification

1. **Auth flow**: Start the backend (`./mvnw spring-boot:run`), open the frontend dev server (`npm run dev`), open in Telegram or use the mock login page. Confirm a JWT is returned.
2. **Matchmaking**: Open 5 browser tabs (or use Postman), join the queue via WebSocket. Confirm a `ROOM_CREATED` event fires.
3. **Scoring**: Submit a correct answer within 500ms; confirm 1000 points. Submit after 1500ms; confirm 400 or 600 points.
4. **Smart Contract**: Deploy to TON testnet using `npx blueprint build && npx blueprint run`. Call `deposit` with 0.5 TON. Call `payout` from the authorized wallet and confirm balance split.
5. **Ink Blot**: Use a power-up in a live game room; confirm the overlay appears on the target player's screen.
6. **Question Pipeline**: POST to `/api/ai/generate-questions` (manual trigger), confirm 10 new rows in the `questions` table.
