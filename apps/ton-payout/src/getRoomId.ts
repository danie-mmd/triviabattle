import { TonClient, Address, TupleBuilder } from '@ton/ton';
const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY,
});
async function check() {
    const addr = Address.parse('EQBKkculywzSn0YoANE46b7VhPV_MalXQovHQ87Hjx51jiqB');
    const res = await client.runMethod(addr, 'roomId');
    const roomId = res.stack.readString();
    console.log('Current Room ID in Contract:', roomId);
}
check();
