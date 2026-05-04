import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4, TonClient, Address, toNano } from '@ton/ton';
import dotenv from 'dotenv';
import path from 'path';

// Force load absolute path .env.production
const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function verifyWallet() {
    console.log("Checking TON Wallet configuration...");
    const mnemonic = process.env.TON_WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error("Missing TON_WALLET_MNEMONIC in .env.production");
    }

    const words = mnemonic.split(' ');
    const key = await mnemonicToWalletKey(words);
    
    const walletV4 = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    
    console.log("Resolved V4 Wallet Address (Bounceable):", walletV4.address.toString({ bounceable: true }));
    console.log("Resolved V4 Wallet Address (Non-Bounceable):", walletV4.address.toString({ bounceable: false }));

    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY,
    });

    try {
        const isDeployed = await client.isContractDeployed(walletV4.address);
        console.log(`Is Wallet Deployed on Mainnet? ${isDeployed}`);

        if (isDeployed) {
            const balance = await client.getBalance(walletV4.address);
            console.log(`Wallet Balance: ${Number(balance) / 1e9} TON`);
        } else {
            console.log("CRITICAL ERROR: This wallet is not deployed on Mainnet. You must send it some TON to initialize it.");
        }
    } catch (e: any) {
        console.error("Error communicating with TonCenter:", e.message);
    }
}

verifyWallet().catch(console.error);
