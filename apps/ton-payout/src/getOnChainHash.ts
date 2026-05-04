import { TonClient, Address } from '@ton/ton';
import crypto from 'crypto';
const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY,
});
async function check() {
    const addr = Address.parse('EQBKkculywzSn0YoANE46b7VhPV_MalXQovHQ87Hjx51jiqB');
    const state = await client.getContractState(addr);
    if (state.code) {
        const hash = crypto.createHash('sha256').update(state.code).digest('hex');
        console.log('On-Chain Code Hash:', hash);
    } else {
        console.log('No Code on-chain');
    }
}
check();
