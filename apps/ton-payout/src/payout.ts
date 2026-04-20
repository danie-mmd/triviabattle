import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4, TonClient, Address, Dictionary, toNano } from '@ton/ton';



import { Escrow } from './bindings/tact_Escrow';

export async function executePayout(recipientWallet: string | undefined, prizeTon: number, feeTon: number): Promise<string> {
    const mnemonic = process.env.TON_WALLET_MNEMONIC;
    if (!mnemonic || mnemonic.trim() === '' || mnemonic.includes('word1')) {
        console.warn('TON_WALLET_MNEMONIC not set correctly. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }

    const words = mnemonic.split(' ');
    if (words.length !== 24) throw new Error('Mnemonic must be 24 words.');

    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY,
    });


    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const walletContract = client.open(wallet);


    const escrowAddressString = process.env.ESCROW_ADDRESS;
    if (!escrowAddressString || escrowAddressString.trim() === '' || escrowAddressString.length < 10) {
        console.warn('ESCROW_ADDRESS not set correctly. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }

    let escrowAddress: Address;
    try {
        escrowAddress = Address.parse(escrowAddressString);
    } catch (e) {
        console.warn('Invalid ESCROW_ADDRESS. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }
    const escrow = client.open(Escrow.fromAddress(escrowAddress));

    // Construct the winners map (Address -> NanoTON mapping expected by Tact)
    const winners = Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
    
    if (recipientWallet && prizeTon > 0) {
        winners.set(Address.parse(recipientWallet), toNano(prizeTon.toFixed(9)));
    }
    
    if (feeTon > 0) {
        // The service fee goes back to the backend wallet itself
        winners.set(wallet.address, toNano(feeTon.toFixed(9)));
    }

    console.log(`[Ton Payout] Sending payout message. Prize: ${prizeTon} to ${recipientWallet}, Fee: ${feeTon} to ${wallet.address.toString()}`);

    // Send the Payout message through our wallet to the Escrow contract
    await escrow.send(walletContract.sender(key.secretKey), {
        value: toNano("0.1") // Higher GAS limit for multiple payouts
    }, {
        $$type: 'Payout',
        winners: winners
    });

    return 'tx_requested_' + Date.now();
}

export async function executeRefund(): Promise<string> {
    const mnemonic = process.env.TON_WALLET_MNEMONIC;
    if (!mnemonic || mnemonic.trim() === '' || mnemonic.includes('word1')) {
        console.warn('TON_WALLET_MNEMONIC not set correctly. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }

    const words = mnemonic.split(' ');
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const walletContract = client.open(wallet);

    console.log(`[Ton Payout] Using wallet address: ${wallet.address.toString()}`);

    const escrowAddressString = process.env.ESCROW_ADDRESS;
    if (!escrowAddressString || escrowAddressString.trim() === '' || escrowAddressString.length < 10) {
        console.warn('ESCROW_ADDRESS not set correctly. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }

    let escrowAddress: Address;
    try {
        escrowAddress = Address.parse(escrowAddressString);
    } catch (e) {
        console.warn('Invalid ESCROW_ADDRESS. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }
    const escrow = client.open(Escrow.fromAddress(escrowAddress));

    // Optional: Check contract status before sending
    try {
        const isSettled = await escrow.getIsSettled();
        const pool = await escrow.getPrizePool();
        console.log(`[Ton Payout] Contract Status - Settled: ${isSettled}, Balance: ${pool} nanoTON`);
        if (isSettled) {
            console.warn('[Ton Payout] WARNING: Contract is already settled. Refund will likely fail.');
        }
    } catch (e: any) {
        console.warn('[Ton Payout] Could not fetch contract status:', e.message);
    }

    const seqno = await walletContract.getSeqno();
    console.log(`[Ton Payout] Sending refund message to contract ${escrowAddressString}...`);

    await escrow.send(walletContract.sender(key.secretKey), {
        value: toNano("0.05")
    }, {
        $$type: 'Refund'
    });

    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log(`[Ton Payout] Waiting for Refund tx to confirm (seqno: ${seqno})...`);
        await new Promise(res => setTimeout(res, 3000));
        currentSeqno = await walletContract.getSeqno();
    }
    console.log(`[Ton Payout] Refund confirmed.`);

    return 'refund_requested_' + Date.now();
}

export async function executeReset(newRoomId: string): Promise<string> {
    const mnemonic = process.env.TON_WALLET_MNEMONIC;
    if (!mnemonic || mnemonic.trim() === '' || mnemonic.includes('word1')) {
        console.warn('TON_WALLET_MNEMONIC not set correctly. Running in mock mode.');
        return 'mock_tx_hash_' + Date.now();
    }

    const words = mnemonic.split(' ');
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY,
    });

    const key = await mnemonicToWalletKey(words);
    const wallet = WalletContractV4.create({ workchain: 0, publicKey: key.publicKey });
    const walletContract = client.open(wallet);

    const escrowAddressString = process.env.ESCROW_ADDRESS;
    if (!escrowAddressString || escrowAddressString.trim() === '' || escrowAddressString.length < 10) {
        console.warn('ESCROW_ADDRESS not set correctly. Running in mock mode.');
        return 'mock_reset_hash_' + Date.now();
    }

    let escrowAddress: Address;
    try {
        escrowAddress = Address.parse(escrowAddressString);
    } catch (e) {
        console.warn('Invalid ESCROW_ADDRESS. Running in mock mode.');
        return 'mock_reset_hash_' + Date.now();
    }

    const escrow = client.open(Escrow.fromAddress(escrowAddress));

    const seqno = await walletContract.getSeqno();
    console.log(`[Ton Payout] Resetting escrow ${escrowAddressString} for new room: ${newRoomId}`);

    await escrow.send(walletContract.sender(key.secretKey), {
        value: toNano("0.05")
    }, {
        $$type: 'Reset',
        newRoomId: newRoomId
    });

    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        console.log(`[Ton Payout] Waiting for Reset tx to confirm (seqno: ${seqno})...`);
        await new Promise(res => setTimeout(res, 3000));
        currentSeqno = await walletContract.getSeqno();
    }
    console.log(`[Ton Payout] Reset confirmed for room: ${newRoomId}`);

    return 'reset_requested_' + Date.now();
}
