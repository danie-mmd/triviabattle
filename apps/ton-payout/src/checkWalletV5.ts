import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV5R1, TonClient } from '@ton/ton';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function verifyWallet() {
    const mnemonic = process.env.TON_WALLET_MNEMONIC;
    const words = mnemonic!.split(' ');
    const key = await mnemonicToWalletKey(words);
    
    const walletV5 = WalletContractV5R1.create({ publicKey: key.publicKey, workchain: 0 });
    console.log("Resolved V5 Wallet Address (Bounceable):", walletV5.address.toString({ bounceable: true }));
    console.log("Resolved V5 Wallet Address (Non-Bounceable):", walletV5.address.toString({ bounceable: false }));
}

verifyWallet().catch(console.error);
