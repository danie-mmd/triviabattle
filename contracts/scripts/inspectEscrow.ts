import { TonClient, Address, fromNano } from '@ton/ton';
import { Escrow } from '../build/Escrow/tact_Escrow';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const escrowAddress = Address.parse("EQAybJAQ1KdU1u3jHyC94EDsogooT4dyIjH8nTlFhsJH71Bu");
    const escrow = client.open(Escrow.fromAddress(escrowAddress));

    console.log('Inspecting Escrow Contract:', escrowAddress.toString());
    
    try {
        const isSettled = await escrow.getIsSettled();
        const pool = await escrow.getPrizePool();
        const depositCount = await escrow.getDepositCount();
        const roomId = await escrow.getRoomId();
        const authorized = await escrow.getAuthorizedBackend();
        
        console.log('--- Current State ---');
        console.log('  Settled:', isSettled);
        console.log('  Room ID:', roomId);
        console.log('  Deposit Count:', depositCount);
        console.log('  Balance:', fromNano(pool), 'TON');
        console.log('  Authorized Backend:', authorized.toString());
    } catch (e) {
        console.error('Failed to fetch state:', e);
    }
}

main().catch(console.error);
