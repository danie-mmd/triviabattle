import { TonClient, Address } from '@ton/ton';
const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY,
});
async function check() {
    const addr = Address.parse('EQDuTzpqHKV3FBT3-xGgeN6H_Qpn0ZSFQ5aiADjD3ssDrBGE');
    const res = await client.runMethod(addr, 'getAuthorizedBackend');
    const backend = res.stack.readAddress();
    console.log('Authorized Backend in Contract:', backend.toString());
}
check();
