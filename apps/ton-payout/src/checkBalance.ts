import { TonClient, Address } from '@ton/ton';
const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: process.env.TONCENTER_API_KEY,
});
client.getBalance(Address.parse('UQBWRc1cIHn-gnyNfPdWYYkbckIym3XbAweWTH-0Suk0jSB8')).then(b => console.log('Balance:', Number(b)/1e9));
