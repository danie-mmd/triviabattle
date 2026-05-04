import { Config } from '@ton/blueprint';

export default {
    network: {
        type: (process.env.TON_NETWORK as 'testnet' | 'mainnet') || 'testnet',
        endpoint: process.env.TON_NETWORK === 'mainnet' 
            ? 'https://toncenter.com/api/v2' 
            : 'https://testnet.toncenter.com/api/v2',
        version: 'v2',
        key: process.env.TONCENTER_API_KEY,
    },
} satisfies Config;