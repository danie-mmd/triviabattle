import { TonClient, Address } from '@ton/ton';
const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY,
});
async function check() {
    const addr = Address.parse('EQBKkculywzSn0YoANE46b7VhPV_MalXQovHQ87Hjx51jiqB');
    const state = await client.getContractState(addr);
    console.log('Account State:', state.state);
    if (state.state === 'active') {
        console.log('Code Hash:', state.code?.toString('hex') || 'No Code');
    }
}
check();
