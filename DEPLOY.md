# TriviaBattle — Deployment Guide 🚀

This document covers the recommended production architecture, smart contract deployment to the TON Mainnet, and a go-to-market virality strategy.

---

## Production Architecture

The most cost-effective GCP topology for a startup launch:

| Layer | Service | Cost Model |
|---|---|---|
| Java Backend + MySQL + Redis | GCP Compute Engine VM (`e2-standard-2`) | Fixed (~$55/mo) |
| Node.js TON Payout Service | GCP Cloud Run (scale-to-zero) | Pay-per-use (~pennies) |
| React Frontend | Firebase Hosting | Free Tier (10 GB CDN) |

> **Why VM for the backend?** Spring Boot with active WebSocket connections requires constant CPU. Cloud Run's "always-on CPU" mode is priced identically to a VM but at a serverless premium — a VM is cheaper and simpler for persistent workloads.

> **Why Cloud Run for payouts?** The Node.js service only wakes for ~30 seconds per TON payout. It scales to zero the rest of the time and the TON wallet mnemonic is completely isolated from the public internet (set ingress to **Internal Only**).

---

## Deploying the Escrow Contract to TON Mainnet

### 1. Fund the Master Wallet
- Open TonKeeper and switch to **Mainnet**.
- Send **~5 TON** to your master wallet to cover initial gas for resets and dust sweeps.
- Update `TON_WALLET_MNEMONIC` in your production `.env`.

### 2. Update the Deployment Script
In `contracts/scripts/deployStandalone.ts`, change the `TonClient` endpoint:

```diff
-  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
+  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
```

Then deploy:
```bash
cd contracts
npm run deploy
```

Copy the resulting **Mainnet Escrow Address**.

### 3. Update Backend Config
In your production `.env` / `application-prod.yml`:

```env
ESCROW_ADDRESS=<new-mainnet-address>
TONCENTER_API_KEY=<mainnet-key-from-@tonapibot>
```

Also update the `TonClient` URL in `payout.ts` to strip the `-testnet` prefix.

### 4. Switch the Frontend to Mainnet
- In `main.tsx`, ensure the `TonConnectUIProvider` manifest points to your production domain.
- Remove any testnet network overrides from your TonConnect configuration.
- Build and deploy:

```bash
cd apps/frontend
npm run build
firebase deploy
```

### 5. Final Smoke Test
- Open the Mini App on Telegram.
- TonKeeper should prompt for a real **1.05 TON** Mainnet transaction.
- Verify the match starts, questions flow, and the winner receives the correct payout from the Escrow contract.

---

## Go-To-Market: Virality Playbook

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
- Dropping this into crypto group chats is free, high-quality acquisition.

### 4. Global Leaderboard & Weekend Tournaments
- Add a Leaderboard tab tracking **Total TON Won** and **Win Rate**.
- Host a **"Sunday Showdown"**: top 3 players on the leaderboard each Sunday receive a manual TON prize from the house. This creates a recurring weekly spike in active players.

### 5. Tap Into TON Alpha Channels
- The TON ecosystem is starved of real skill-based games (most are "Tap to Earn").
- Reach out to *TON Daily*, *Tonkeeper News*, and large CIS Telegram groups.
- Offer an exclusive promo code for **5 Free Credits** to their community.
- A polished PvP game with real on-chain settlements is genuinely newsworthy in this space.