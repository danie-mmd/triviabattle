# TriviaBattle Profit Analysis & Tokenomics

For these calculations, we assume a baseline fiat value of **1 TON = $5.00**. 

## 1. The Per-Game Revenue & Gas Costs
The entry fee is **1.0 TON** ($5.00). The house takes a **20% Service Fee** from the total pool.
However, we must also deduct the static house overhead (Gas fees for automated resets and payouts) which average about **~0.10 TON ($0.50)** total per game.

Here is the precise net profit breakdown per game:

*   **2-Player Game (Pool: 2 TON | $10.00)**
    *   Gross House Cut (20%): 0.40 TON ($2.00)
    *   Minus Gas Overhead: -0.10 TON (-$0.50)
    *   **Net Profit:** **0.30 TON ($1.50)** 
    *   *Real-World Margin: 15%*

*   **3-Player Game (Pool: 3 TON | $15.00)**
    *   Gross House Cut (20%): 0.60 TON ($3.00)
    *   Minus Gas Overhead: -0.10 TON (-$0.50)
    *   **Net Profit:** **0.50 TON ($2.50)**
    *   *Real-World Margin: 16.6%*

*   **4-Player Game (Pool: 4 TON | $20.00)**
    *   Gross House Cut (20%): 0.80 TON ($4.00)
    *   Minus Gas Overhead: -0.10 TON (-$0.50)
    *   **Net Profit:** **0.70 TON ($3.50)**
    *   *Real-World Margin: 17.5%*

*   **5-Player Game (Pool: 5 TON | $25.00)**
    *   Gross House Cut (20%): 1.00 TON ($5.00)
    *   Minus Gas Overhead: -0.10 TON (-$0.50)
    *   **Net Profit:** **0.90 TON ($4.50)**
    *   *Real-World Margin: 18%*

---

## 2. Breaking Even on a $55/mo Server
To cover a **$55 per month base base Infrastructure Cost**, here is exactly how many games you need to successfully run per month (assuming an average TON price of $5):

*   **If only 2-Player Games:** 37 games/month *(~1.2 games per day)*
*   **If only 3-Player Games:** 22 games/month *(~0.7 games per day)*
*   **If only 4-Player Games:** 16 games/month *(~1 game every 2 days)*
*   **If only 5-Player Games:** 13 games/month *(~1 game every 2-3 days)*

---

## 3. Scaling & Pure Profit
Once those first ~25 average games of the month cover the server footprint, everything else is pure, scalable profit. 

If your Telegram Mini App gains traction and you average just **5 full games (5 players) per day**:
*   Monthly Games: 150
*   Net Monthly Profit: **135 TON (~$675.00)** 

If it goes viral and scales to **100 full games a day**:
*   Monthly Games: 3,000
*   Net Monthly Profit: **2,700 TON (~$13,500.00)** 

Because the Java backend VM operates at a flat fee and the Node.js payouts cost virtually nothing under a serverless scale-to-zero model, your server costs will hardly budge as you scale from $600 to $13,000 in monthly revenue. The fixed 20% model provides an extremely lucrative and secure business foundation.
