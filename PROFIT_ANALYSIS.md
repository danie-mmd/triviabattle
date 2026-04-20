# TriviaBattle Economy & Profit Analysis

This analysis is based on the **1.0 TON** entry fee and the **80/20** prize split.

## Assumptions
- **Entry Fee**: 1.0 TON per player.
- **Commission**: 20% of the total pool goes to the Admin wallet (Test 1).
- **Admin Gas Expense**: ~0.15 TON total per game room (0.05 for Reset + 0.10 for Payout).
- **Winner Prize**: 80% of the total pool.

## Profit Projection Table

| Players | Total Pool | Winner Prize (80%) | Admin Fee (20%) | Gas Expense (Est) | **Net Profit** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1 (Solo)** | 1.0 TON | 0.8 TON | 0.20 TON | 0.15 TON | **+0.05 TON** |
| **2 Players** | 2.0 TON | 1.6 TON | 0.40 TON | 0.15 TON | **+0.25 TON** |
| **3 Players** | 3.0 TON | 2.4 TON | 0.60 TON | 0.15 TON | **+0.45 TON** |
| **4 Players** | 4.0 TON | 3.2 TON | 0.80 TON | 0.15 TON | **+0.65 TON** |
| **5 Players** | 5.0 TON | 4.0 TON | 1.00 TON | 0.15 TON | **+0.85 TON** |

## Key Insights
1. **Profitability Threshold**: At 1.0 TON entry, you are profitable even in a **Solo Match** (+0.05 TON). 
2. **Growth Scaling**: For every additional player in the room, your net profit increases by **0.20 TON** without any additional gas cost (since gas is per transaction, not per player).
3. **Efficiency**: Your profit margin at a full 5-player room is **17%** of the total volume (0.85 profit on 5.0 volume).

## Optimization Opportunities
- **Gas Reduction**: Currently, I have set "safe" gas limits (0.05 and 0.1). Once we monitor the actual costs on testnet, we can likely reduce these to 0.02 and 0.05, which would add an extra **~0.08 TON** profit per room.
- **Dust Reclaim**: The "Gas Expense" above is the amount *sent* to the contract. The actual network fee is usually ~0.02 TON. The remaining ~0.13 TON stays in the contract. Implementing an "Auto-Sweep" would transfer this entire 0.13 back to you, significantly increasing your margins.

> [!TIP]
> To maximize your profit, encourage larger room sizes! A single 5-player game is 17x more profitable than a solo game for you.
