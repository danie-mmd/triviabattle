/*!
 * Escrow.tact – TriviaBattle TON Smart Contract
 *
 * Prize pool escrow for multiplayer trivia games.
 *
 * Flow:
 *  1. Each of the 5 players sends 0.5 TON with message "deposit"
 *  2. The contract accumulates 2.5 TON (minus gas fees)
 *  3. The authorised backend wallet calls "payout" with winner addresses
 *  4. The contract transfers the prize pool to the winner(s)
 *  5. If the game is cancelled, the backend calls "refund" and all
 *     depositors receive their entry fee back
 *
 * Security:
 *  - Only `authorizedBackend` can trigger payout and refund
 *  - Deposits are tracked individually so refunds are exact
 *  - The contract verifies the expected entry fee amount on deposit
 */

import "@stdlib/deploy";

// ── Messages ──────────────────────────────────────────────────────────────────

message Deposit {}

message Payout {
    winners: map<Address, Int>;  // address → share in nanoTON
}

message Refund {}

message WithdrawDust {}

// ── Contract ──────────────────────────────────────────────────────────────────

contract Escrow with Deployable {

    // The backend wallet address that is allowed to trigger payouts/refunds
    authorizedBackend: Address;

    // The room ID this escrow is associated with (for off-chain correlation)
    roomId: String;

    // Entry fee in nanoTON (0.5 TON = 500_000_000 nanoTON)
    entryFeeNano: Int;

    // Deposits: player address → amount deposited in nanoTON
    deposits: map<Address, Int>;

    // Total number of depositors so far
    depositCount: Int as uint8;

    // Whether the game has been settled (payout or refund issued)
    settled: Bool;

    // ── Initialisation ────────────────────────────────────────────────────────

    init(authorizedBackend: Address, roomId: String, entryFeeNano: Int) {
        self.authorizedBackend = authorizedBackend;
        self.roomId = roomId;
        self.entryFeeNano = entryFeeNano;
        self.deposits = emptyMap();
        self.depositCount = 0;
        self.settled = false;
    }

    // ── Deposit ───────────────────────────────────────────────────────────────

    receive(msg: Deposit) {
        require(!self.settled, "Game already settled");
        require(self.depositCount < 5, "Room is full");

        let amount: Int = context().value;
        require(amount >= self.entryFeeNano, "Insufficient entry fee");

        let sender: Address = sender();
        require(self.deposits.get(sender) == null, "Already deposited");

        self.deposits.set(sender, amount);
        self.depositCount = self.depositCount + 1;

        emit("Deposited".asComment());
    }

    // ── Payout ────────────────────────────────────────────────────────────────

    receive(msg: Payout) {
        require(sender() == self.authorizedBackend, "Unauthorized");
        require(!self.settled, "Already settled");

        self.settled = true;

        // Distribute to each winner according to their share
        foreach(addr, share in msg.winners) {
            send(SendParameters{
                to:     addr,
                value:  share,
                mode:   SendPayGasSeparately,
                bounce: false,
                body:   "Prize payout".asComment()
            });
        }

        emit("Settled".asComment());
    }

    // ── Refund ────────────────────────────────────────────────────────────────

    receive(msg: Refund) {
        require(sender() == self.authorizedBackend, "Unauthorized");
        require(!self.settled, "Already settled");

        self.settled = true;

        foreach(addr, amount in self.deposits) {
            send(SendParameters{
                to:     addr,
                value:  amount,
                mode:   SendPayGasSeparately,
                bounce: false,
                body:   "Entry fee refund".asComment()
            });
        }

        emit("Refunded".asComment());
    }

    // ── Withdraw dust (owner cleanup) ─────────────────────────────────────────

    receive(msg: WithdrawDust) {
        require(sender() == self.authorizedBackend, "Unauthorized");
        require(self.settled, "Not yet settled");

        send(SendParameters{
            to:     self.authorizedBackend,
            value:  0,
            mode:   SendRemainingBalance,
            bounce: false
        });
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    get fun prizePool(): Int {
        return myBalance();
    }

    get fun depositCount(): Int {
        return self.depositCount;
    }

    get fun isSettled(): Bool {
        return self.settled;
    }

    get fun getDeposit(addr: Address): Int {
        let amount: Int? = self.deposits.get(addr);
        return amount != null ? amount!! : 0;
    }

    get fun roomId(): String {
        return self.roomId;
    }
}
