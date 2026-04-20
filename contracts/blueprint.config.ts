import { Config } from '@ton/blueprint';

export default {
    network: {
        type: 'testnet',
        endpoint: 'https://testnet.toncenter.com/api/v2',
        version: 'v2',
        key: process.env.TONCENTER_API_KEY,
    },
} satisfies Config;