# TriviaBattle — Production Deployment Guide 🚀

This guide provides a chronologically ordered, step-by-step process for taking TriviaBattle live on the **TON Mainnet** using a cost-optimized, serverless-first GCP architecture.

---

## 🏛️ Architecture Overview (Zero-Traction Start)
- **Frontend**: Firebase Hosting ($0/mo base)
- **Backend**: GCP Cloud Run with GraalVM Native Image ($0 idle cost)
- **TON Payout Service**: GCP Cloud Function ($0 idle cost)
- **Database**: Existing MySQL VM
- **Matchmaking State**: Upstash Redis (Free Tier)

---

## 🛠️ Step 0: GCP Project Setup
Before any code can be deployed, your GCP environment must be configured.

1.  **Create/Select Project**:
    - Identify your GCP Project ID: `messages-poc-447012`.
    - Set it locally: `gcloud config set project [PROJECT_ID]`
2.  **Enable APIs**:
    - Run the following to enable the serverless stack:
    ```bash
    gcloud services enable \
      run.googleapis.com \
      cloudfunctions.googleapis.com \
      artifactregistry.googleapis.com \
      cloudbuild.googleapis.com
    ```
3.  **Region Selection**:
    - Recommended: `europe-west1` (Low latency for many TON users).
    - Set default: `gcloud config set run/region [REGION]`
4.  **TON Mainnet API Key**:
    - Obtain a Mainnet-specific API key from **[@toncenter_bot](https://t.me/toncenter_bot)**.
    - Update `TONCENTER_API_KEY` in `.env.production`.

---

## Step 1: TON Mainnet Contract Deployment
Your game logic depends on a live Escrow contract.

1.  **Select Environment**:
    - For Testnet: Ensure `contracts/.env.test` is ready.
    - For Mainnet: Ensure `contracts/.env.production` is populated with your Mainnet mnemonic.
2.  **Deploy**:
    ```bash
    cd contracts
    npm run deploy:prod  # Uses Mainnet settings and the new production wallet
    ```
3.  **Record the Address**: Save the resulting **Mainnet Escrow Address**; you'll need it for the Backend and Payout service.

---

## Step 2: TON Payout Service (Cloud Function)
The payout service handles prizes and resets.

1.  **Build**:
    ```bash
    cd apps/ton-payout
    npm run build
    ```
2.  **Deploy to GCP**:
    ```bash
    gcloud functions deploy ton-payout \
      --gen2 \
      --runtime=nodejs20 \
      --region=europe-west1 \
      --source=. \
      --entry-point=tonPayoutFunction \
      --trigger-http \
      --allow-unauthenticated \
      --set-env-vars "TON_WALLET_MNEMONIC=...,ESCROW_ADDRESS=...,TONCENTER_API_KEY=..."
    ```
3.  **Note the URL**: After deployment, GCP will provide an HTTPS URL for the function. Save this for Step 3.

---

## Step 3: Backend Deployment (Cloud Run)
We use a **Native Image** build to ensure the game wakes up in <200ms when players connect.

1.  **Build the Container Image**:
    ```bash
    cd apps/backend
    docker build -t gcr.io/messages-poc-447012/trivia-backend:latest -f Dockerfile.native .
    docker push gcr.io/messages-poc-447012/trivia-backend:latest
    ```
2.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy trivia-backend \
      --image gcr.io/messages-poc-447012/trivia-backend:latest \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars "MYSQL_URL=jdbc:mysql://[VM_IP]:3306/trivia,REDIS_HOST=rational-koi-107105.upstash.io,SPRING_PROFILES_ACTIVE=prod"
    ```
    *(Ensure you also set `BOT_TOKEN`, `JWT_SECRET`, and the `TON_PAYOUT_URL` pointing to the function from Step 2).*

---

## Step 4: Frontend Deployment (Firebase)
Finally, we point the React app to the production backend URLs.

1.  **Update Manifest**: ensure `apps/frontend/public/tonconnect-manifest.json` has the `url` property matching your **exact** host origin (e.g. `https://your-app.web.app`). TonConnect will reject the connection if this mismatch exists.
2.  **Configure Environment**: Update `apps/frontend/.env.production` with your Cloud Run HTTPS/WSS URLs.
3.  **Deploy**:
    ```bash
    cd apps/frontend
    npm run build
    firebase deploy
    ```

---

## Step 5: Final Validation & Launch
1.  **Join a Match**: Open your Telegram Bot, connect your real TonKeeper wallet.
2.  **Deposit**: Confirm a 1.05 TON transaction on the **Mainnet**.
3.  **Verify Flow**: Ensure questions are served normally and the Payout Cloud Function triggers upon completion.

---

## 📈 Growth Strategy
Once live, follow this **Virality Playbook** to start scaling toward your first 1,000 users!

---

## 🚀 Go-To-Market: Virality Playbook

### 1. The Freemium Trojan Horse (Credits Match)
- Give every new user **2 Free Credits** on first launch — enough to play 2 full matches.
- Once hooked by the real-time competition, they'll bridge a wallet and buy into the TON pool.

### 2. Referral Mechanics (The Telegram Loop)
- Add an **"Invite a Friend"** button that generates a deep-link share message.
- **Standard:** Both users get 3 Free Credits when the friend plays their first match.
- **Whale:** Referrers earn 15% of the house fee on every TON match their referrals ever play.

### 3. Auto-Brag on Win (Social Proof)
- On `ResultsPage.tsx`, show a **"Share My Win"** button for TON match winners.
- Auto-populates a Telegram share: *"🧠 I just won 4.0 TON ($20) destroying 4 players on TriviaBattle! Think you're smarter? [Link]"*

### 4. Global Leaderboard & Weekend Tournaments
- Add a Leaderboard tab tracking **Total TON Won** and **Win Rate**.
- Host a **"Sunday Showdown"**: top 3 players on the leaderboard each Sunday receive a manual TON prize from the house.

### 5. Tap Into TON Alpha Channels
- The TON ecosystem is starved of real skill-based games (most are "Tap to Earn").
- Reach out to *TON Daily*, *Tonkeeper News*, and large TON-specific Telegram Alpha groups.
- Offer an exclusive promo code for **5 Free Credits** to their community.