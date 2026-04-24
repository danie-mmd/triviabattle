The Most Cost-Effective GCP Architecture
For a startup/production launch balancing extreme low cost with high performance, your ideal topology looks like this:

The VM Layer (Fixed Cost)

Run your Java Spring Boot Backend, your existing MySQL Database, and a Redis Docker container all on standard Compute Engine VMs (or even on a single strong VM like an e2-standard-2 if you want to keep costs rock bottom at first). You pay a flat, predictable monthly rate.

The Node.js Payout Microservice (Serverless -> $0)

Put only the Node.js API on Cloud Run and configure it to scale to 0. Since it only wakes up for 30 seconds when someone wins a TON match, you only pay exactly for those seconds. Because traffic will be sporadic, this will likely cost you less than pennies a month while keeping your TON wallet mnemonic perfectly isolated from your main VM.

The Frontend (Free Tier)

Dump the Vite build onto Firebase Hosting. Their free tier includes 10 GB of high-speed global CDN bandwidth, which is more than enough for thousands of daily users opening the Telegram Mini App.

This hybrid approach leverages "old-school" VMs for heavy, persistent connections to keep costs flat, while using modern Serverless exactly where it fits mathematically: sporadic background payout scripts!


1. Fund the Master Wallet on Mainnet
Your Node.js microservice uses TON_WALLET_MNEMONIC to deploy contracts and pay for refunds/resets.

Open your TonKeeper app (make sure it's set to Mainnet, not Testnet).
Create a new Master Wallet explicitly for production, or use your existing one.
Send ~5 TON to this wallet so it has enough gas for the initial automated resets and dust sweeps.
Update the TON_WALLET_MNEMONIC in your production .env file with these 24 words.

2. Update the Deployment Script
In the contracts/scripts/ folder, find your deployment script (likely deployStandalone.ts).

Locate the TonClient initialization and change the endpoint:
From: https://testnet.toncenter.com/api/v2/jsonRPC
To: https://toncenter.com/api/v2/jsonRPC

Run the deployer: npm run deploy
Copy the brand new Mainnet Escrow Address that it spits out.
3. Update Backend Settings
In your production .env / application-prod.yml:

Update ESCROW_ADDRESS to the new Mainnet address.
Update TONCENTER_API_KEY to a Mainnet API key (you can grab this for free from the @tonapibot on Telegram).
Update the TonClient URLs in payout.ts (Node microservice) and TonService.java (if it queries directly) to point to the mainnet URL.

4. Switch the Frontend
In your React/Vite app, you need to tell TonConnect to stop hitting the Testnet.

If you are using @tonconnect/ui-react, find your <TonConnectUIProvider> component.
It usually looks for a manifest.json. Ensure any network override flags are explicitly pointing to mainnet, or simply remove any -testnet suffixes from your DApp configuration.
Build and deploy the frontend (npm run build).

5. Final Smoke Test
Join a match yourself on the production site.
TonKeeper will now prompt you for a real 1.05 TON transaction on the Mainnet.
Verify the match starts, questions flow, and the winner correctly receives the 0.80 TON (or 1.60 TON for two players) payout back into their real wallet!
Those 5 steps will complete the transition into full production! Have you already secured a Mainnet API key from Toncenter?



That is the true million-dollar question! Building a great game is only 20% of the battle; acquiring users in the dense Web3 space is the other 80%.

Fortunately, by building this as a Telegram Mini App hooked into TON, you have access to the absolute best viral mechanics in the world right now. Here is a 5-step playbook to engineer virality for TriviaBattle:

1. The "Freemium" Trojan Horse (Credits)
You already have the ultimate weapon: The CREDITS match!

The Hook: Give every single new user who opens the bot 2 Free Credits (enough for 2 free matches).
They get to experience the thrill of the match, the sabotages, and the leaderboard without spending a dime.
Once they win or run out of credits, they will be immensely tempted to bridge a wallet and play for actual TON.
2. Aggressive Referral Mechanics (The Telegram Loop)
Telegram makes sharing incredibly easy. You need to incentivize it heavily.

Add an "Invite a Friend" button that sends a rich Telegram message (with a cool custom image of a Trivia Arena).
The Reward: "Invite 1 friend who plays a match, and you both get 3 Free Credits!"
The Whale Reward: "Get 15% of the House Service Fee for every TON match your referred friends play forever." (This turns your ambitious players into active marketing agents for you).
3. The Auto-Brag Feature (Social Proof)
When someone wins a huge 5-player pot, they feel like a genius and want everyone to know.

On the 

ResultsPage.tsx
, whenever someone wins a TON match, add a massive "Brag to Group" button.
It should auto-generate a Telegram message utilizing the Telegram Share URL: "🧠 I just destroyed 4 people and won 4.0 TON ($20) playing TriviaBattle! Think you're smarter than me? Prove it: [Link]"
Dropping this into random crypto group chats brings in highly competitive Web3 degens.
4. Global Leaderboards & Weekend Tournaments
Trivia players are inherently competitive.

Add a simple "Global Leaderboard" tab tracking "Total TON Won" and "Win Percentage".
Host a "Sunday Showdown". Guarantee that anyone who plays on Sunday afternoon receives double MMR/Rank points, and manually drop 10 TON into the wallets of the top 3 players on the leaderboard at the end of the week.
This builds a habitual loop where players must return at specific times, creating massive concurrent player spikes.
5. Tap into TON Alpha Channels
The TON ecosystem is starving for high-quality, actual playable games (everything right now is just "Tap to Earn" farming).

Reach out to major Telegram alpha channels (like TON Daily, Tonkeeper News, etc.)
Tell them you have an active, fully functional skill-based PvP game that settles in real TON via smart contracts.
Offer their community an exclusive promo code or link for 5 free Trivia Credits. Because TriviaBattle is highly polished, they will likely cover it for free or extremely cheap because it gives real utility to the TON blockchain.
If you implement the Referrals and the Auto-Brag buttons alongside your existing Credits system, the game will organically market itself every time someone plays!