# TriviaBattle — Profit Analysis & Tokenomics 💰

Assumptions: **1 TON = $5.00** · **Entry Fee = 1.0 TON** · **House Cut = 20%** · **Gas Overhead ≈ 0.10 TON/game**

---

## Per-Game Revenue Breakdown

| Players | Pool (TON) | Pool (USD) | Gross Cut (20%) | Gas Overhead | **Net Profit** | Margin |
|---------|-----------|-----------|----------------|-------------|----------------|--------|
| 2 | 2.0 TON | $10.00 | 0.40 TON | -0.10 TON | **0.30 TON ($1.50)** | 15.0% |
| 3 | 3.0 TON | $15.00 | 0.60 TON | -0.10 TON | **0.50 TON ($2.50)** | 16.6% |
| 4 | 4.0 TON | $20.00 | 0.80 TON | -0.10 TON | **0.70 TON ($3.50)** | 17.5% |
| 5 | 5.0 TON | $25.00 | 1.00 TON | -0.10 TON | **0.90 TON ($4.50)** | 18.0% |

> Gas overhead covers one Escrow reset (~0.05 TON) and one payout transaction (~0.05 TON) per game.

---

## Infrastructure Cost Comparison

| Strategy | Monthly Fixed | Scalability | Recommended For |
|---|---|---|---|
| **Option A (VM)** | **~$55.00** | Linear vertical | High traffic / Stable users |
| **Option B (Serverless)** | **$0.00** | Elastic horizontal | Launch / Low traffic |

> **Note on Option B:** While serverless has no fixed costs, the unit cost (price per match) is slightly higher on Cloud Run than a VM once you hit several thousand games a month. Pivot to a VM only when your volume justifies $55/mo.

---

## Break-Even Analysis (Zero-Traction Start)

To cover a flat **$55/month** server cost (GCP `e2-standard-2` VM):

| Game Mix | Games Needed | Daily Rate |
|---|---|---|
| 2-player only | 37 games/mo | ~1.2/day |
| 3-player only | 22 games/mo | ~0.7/day |
| 4-player only | 16 games/mo | ~1 every 2 days |
| 5-player only | 13 games/mo | ~1 every 2–3 days |

> With a realistic mix of player counts, **~20–25 completed games per month** covers the server entirely.

---

## Scaling & Pure Profit

Once break-even is reached, every additional game is **100% margin profit** since server costs are flat.

| Daily Games (5-player) | Monthly Games | Monthly Net Profit | USD Equivalent |
|---|---|---|---|
| 5 | 150 | 135 TON | ~$675 |
| 20 | 600 | 540 TON | ~$2,700 |
| 50 | 1,500 | 1,350 TON | ~$6,750 |
| 100 | 3,000 | 2,700 TON | ~$13,500 |

> Because the Java backend runs at a fixed VM cost and the Node.js payout service runs serverless at scale-to-zero, infrastructure costs **do not scale with revenue**. The 20% house fee provides a stable, highly scalable business model.
