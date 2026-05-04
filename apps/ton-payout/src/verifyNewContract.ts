import { TonClient, Address } from '@ton/ton';
const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY,
});
async function check() {
    const addr = Address.parse('EQDuTzpqHKV3FBT3-xGgeN6H_Qpn0ZSFQ5aiADjD3ssDrBGE');
    try {
        const res = await client.runMethod(addr, 'roomId');
        const roomId = res.stack.readString();
        console.log('New Contract Room ID:', roomId);
        
        const state = await client.getContractState(addr);
        console.log('Contract State:', state.state);
    } catch (e) {
        console.log('Contract not yet active or reachable:', e.message);
    }
}
check();
