import { WalletContractV4, TonClient, Address, toNano, beginCell, internal } from '@ton/ton';
import { Escrow } from '../build/Escrow/tact_Escrow';
import { mnemonicToWalletKey } from '@ton/crypto';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) throw new Error("WALLET_MNEMONIC not set");

    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const walletContract = client.open(wallet);

    // DcoA is the address from the mnemonic
    const authorizedBackend = Address.parse("EQCgZK_3KBYQy5r3qTpMC2Q_qFI_9gZ71chvqrX5BeVvDcoA");
    const roomId = "test-room-" + Date.now();
    const entryFee = toNano('0.01');

    console.log('Deploying Escrow with:');
    console.log('  authorizedBackend:', authorizedBackend.toString());
    console.log('  roomId:', roomId);
    console.log('  entryFee:', entryFee.toString(), 'nanoTON');

    const escrowInit = await Escrow.fromInit(authorizedBackend, roomId, entryFee);
    const escrowAddress = escrowInit.address;

    console.log('Deploying at:', escrowAddress.toString());

    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: escrowAddress,
                value: toNano('0.05'),
                bounce: false,
                init: escrowInit.init,
                body: beginCell().endCell(), 
            })
        ],
    });

    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log('Waiting for deployment transaction...');
        await new Promise(res => setTimeout(res, 3000));
        currentSeqno = await walletContract.getSeqno();
    }

    console.log('\n✅ Deployment successful!');
    console.log('Escrow Address:', escrowAddress.toString());
}

main().catch(console.error);
