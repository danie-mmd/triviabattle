# TriviaBattle – Scaffold Walkthrough

All 4 phases scaffolded at `/home/danie/Development/Projects/Antigravity/TriviaBattle`.

## File Tree (50 files)

```
TriviaBattle/
├── .env.example                  ← All secrets documented
├── .gitignore
├── package.json                  ← npm workspaces root
├── README.md
│
├── apps/
│   ├── frontend/                 ← React 18 + Vite + TypeScript
│   │   ├── index.html            ← telegram-web-app.js injected here
│   │   ├── package.json          ← TonConnect, Zustand, Framer Motion
│   │   ├── vite.config.ts        ← Proxy to :8080 for dev
│   │   ├── tsconfig.json
│   │   ├── firebase.json         ← Firebase Hosting config (dist/)
│   │   ├── .firebaserc
│   │   └── src/
│   │       ├── main.tsx          ← TonConnectUIProvider + BrowserRouter
│   │       ├── App.tsx           ← Routes (Login → Lobby → Game → Results)
│   │       ├── index.css         ← Dark theme, glassmorphism, design tokens
│   │       ├── hooks/
│   │       │   └── useTelegram.ts      ← Full SDK wrapper + types
│   │       ├── services/
│   │       │   └── api.ts              ← Axios + JWT interceptor
│   │       ├── store/
│   │       │   └── gameStore.ts        ← Zustand: scores, questions, sabotage
│   │       ├── pages/
│   │       │   ├── LoginPage.tsx       ← initData auth + WalletConnect
│   │       │   ├── LobbyPage.tsx       ← Queue join/leave + Stars shop
│   │       │   ├── GamePage.tsx        ← WebSocket manager + game UI
│   │       │   └── ResultsPage.tsx     ← Leaderboard + TON prize display
│   │       └── components/
│   │           ├── WalletConnect.tsx   ← TonConnect UI
│   │           ├── StarsPurchase.tsx   ← Telegram Stars invoices
│   │           └── game/
│   │               ├── QuestionCard.tsx    ← Timer bar + answer options
│   │               ├── PowerUpBar.tsx      ← 3 power-ups with count badges
│   │               └── InkBlotOverlay.tsx  ← SVG sabotage full-screen overlay
│   │
│   └── backend/                  ← Spring Boot 3 + WebFlux + Java 21
│       ├── Dockerfile            ← Multi-stage, JRE 21 Alpine, Cloud Run ready
│       ├── pom.xml               ← WebFlux, JPA, Redis, JWT, Flyway, Lombok
│       └── src/main/
│           ├── resources/
│           │   ├── application.yml           ← All env vars, local+prod profiles
│           │   └── db/migration/V1__init.sql ← 6-table MySQL DDL (Flyway)
│           └── java/za/co/triviabattle/
│               ├── TriviaBattleApplication.java
│               ├── auth/
│               │   ├── TelegramAuthUtils.java  ← HMAC-SHA256 validator
│               │   ├── TelegramUser.java
│               │   └── AuthController.java     ← POST /api/auth/login → JWT
│               ├── config/
│               │   ├── RedisConfig.java        ← Reactive JSON template
│               │   ├── WebSocketConfig.java    ← /ws/game mapping
│               │   └── SecurityConfig.java     ← CORS + public endpoints
│               ├── game/
│               │   ├── model/Room.java         ← Redis entity (5 players)
│               │   ├── model/GameState.java    ← WAITING/QUESTION_ACTIVE/…
│               │   ├── service/MatchmakingService.java ← ZSET queue, @Scheduled
│               │   ├── service/ScoringService.java     ← Time-Bucket 500ms
│               │   ├── handler/GameWebSocketHandler.java ← Reactor Sinks
│               │   └── controller/MatchmakingController.java
│               ├── payment/
│               │   └── PaymentController.java  ← Stars invoice + webhook
│               └── ai/
│                   └── QuestionGeneratorJob.java ← Gemini API + cron
│
└── contracts/                    ← Tact smart contracts (Blueprint)
    ├── package.json              ← Local blueprint + tact + sandbox
    ├── blueprint.config.ts       ← Targets testnet
    └── contracts/
        └── Escrow.tact           ← Deposit → Payout/Refund escrow
```

## What Was Built Per Phase

### Phase 1 ✅ – Foundation
| Item | Detail |
|---|---|
| Monorepo | npm workspaces: `apps/frontend`, `contracts` |
| Telegram SDK | `useTelegram.ts` wraps full SDK, exposes typed user/haptics/alerts |
| Auth | `initData` → HMAC-SHA256 validation → JWT (standard `jjwt` library) |
| Freshness check | `auth_date` must be < 24h old |
| Mock login | Falls back gracefully when `initData` is empty (dev mode) |

### Phase 2 ✅ – Game Loop
| Item | Detail |
|---|---|
| Room | Redis JSON, 30-min TTL, tracks 5 players + scores + state |
| Matchmaking | ZSET queue, pops 5 every 2s, forms room, preserves FIFO order |
| WebSocket | Reactive `Sinks.Many<String>` per room (multicast fan-out) |
| State machine | WAITING → QUESTION_ACTIVE → INTERMISSION → GAME_OVER |
| Scoring | 500ms buckets: 1000/800/600/400/200pts; constant-time safe |

### Phase 3 ✅ – Economic Layer
| Item | Detail |
|---|---|
| Escrow.tact | Tracks individual deposits; only authorizedBackend can payout/refund |
| Stars invoices | `createInvoiceLink` via Bot API, `XTR` currency |
| Stars webhook | Pre-checkout approval + `successful_payment` handler |
| TonConnect | `@tonconnect/ui-react`, shows address after connect |

### Phase 4 ✅ – UI & AI
| Item | Detail |
|---|---|
| InkBlotOverlay | SVG blob + Framer Motion, 5s auto-dismiss via Zustand |
| PowerUpBar | Count badges, disabled when depleted, sends `USE_POWERUP` over WS |
| QuestionCard | Shrinking progress bar, 4-option grid, locks after first answer |
| Gemini cron | `0 0 4 * * *` UTC (06:00 SAST), manual trigger via `POST /api/ai/generate-questions` |
| Prompt | Requests 10 SA+global questions in structured JSON, strips markdown fences |

## Next Steps (when ready to run)

```bash
# 1. Install frontend dependencies
cd apps/frontend && npm install
```

## Starting the Frontend
You can start the frontend development server in two ways:

1. **From the root directory**:
   ```bash
   npm run dev:frontend
   ```
2. **From the `apps/frontend` directory**:
   ```bash
   npm run dev
   ```

The frontend will then be available at `http://localhost:3000`.

## Success: Fix TON Connect Manifest Error
The `TON_CONNECT_SDK_ERROR` was caused by the frontend not loading environment variables from the root monorepo directory, leaving `VITE_TON_MANIFEST_URL` undefined.

**Changes Made:**
1. **[apps/frontend/vite.config.ts](file:///home/danie/Development/Projects/Antigravity/TriviaBattle/apps/frontend/vite.config.ts)**: Added `envDir: '../../'` to tell Vite to look for the `.env` file in the root directory.
2. **[.env](file:///home/danie/Development/Projects/Antigravity/TriviaBattle/.env)**: Updated `VITE_TON_MANIFEST_URL` to point to the local server `http://localhost:3000/tonconnect-manifest.json`.

**Verification Result:**
Vite now correctly loads the environment variables, providing the `manifestUrl` to `TonConnectUIProvider`, resolving the runtime error.

## Success: Exposing Localhost for Telegram Testing
To test your Mini App on Telegram, you need a public HTTPS URL. You have successfully set up a Cloudflare Tunnel.

### Steps to Finalize Your Setup:

1. **Vite Configuration:**
   I've updated your `apps/frontend/vite.config.ts` to allow the Cloudflare host:
   ```typescript
   server: {
     allowedHosts: ['adipex-cohen-winds-barry.trycloudflare.com'],
     port: 3000,
     ...
   }
   ```

2. **Update your `.env`:**
   I've updated `VITE_TON_MANIFEST_URL` in your root `.env` to your Cloudflare URL:
   ```text
   VITE_TON_MANIFEST_URL=https://adipex-cohen-winds-barry.trycloudflare.com/tonconnect-manifest.json
   ```

3. **Restart the Frontend:**
   Stop your `npm run dev:frontend` and start it again so it picks up the changes.

4. **Update Telegram Bot:**
   - Go to [@BotFather](https://t.me/BotFather) on Telegram.
   - Use `/mybots` -> Select your bot -> **Bot Settings** -> **Menu Button** -> **Configure Menu Button**.
   - Set the URL to your Cloudflare URL: `https://adipex-cohen-winds-barry.trycloudflare.com/`.

```bash
# 2. Install contract toolchain
cd ../../contracts && npm install

# 3. Start backend (needs MySQL + Redis running locally)
cd ../backend
cp ../../.env.example ../../.env   # fill in BOT_TOKEN etc.
./mvnw spring-boot:run

# 4. Start frontend dev server
cd ../frontend && npm run dev
# → http://localhost:3000

# 5. Build the smart contract
cd ../../contracts
npx blueprint build
```
