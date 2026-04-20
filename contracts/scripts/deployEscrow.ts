import { toNano, Address } from '@ton/core';
import { Escrow } from '../wrappers/Escrow';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // ⚠️ Replace with the wallet address shown in TonKeeper (testnet mode)
    // This is your wallet that controls payouts - the "authorized backend"
    const authorizedBackend = Address.parse("EQCgZK_3KBYQy5r3qTpMC2Q_qFI_9gZ71chvqrX5BeVvDcoA");


    const roomId = "test-room-001";
    const entryFee = toNano('0.01'); // 0.01 TON in nanoTON

    console.log('Deploying Escrow with:');
    console.log('  authorizedBackend:', authorizedBackend.toString());
    console.log('  roomId:', roomId);
    console.log('  entryFee:', entryFee.toString(), 'nanoTON');

    const escrow = provider.open(await Escrow.fromInit(authorizedBackend, roomId, entryFee));

    await escrow.send(
        provider.sender(),
        { value: toNano('0.05') }, // deployment gas (~0.05 TON)
        { $$type: 'Deploy', queryId: 0n }
    );

    await provider.waitForDeploy(escrow.address);
    console.log('\n✅ Escrow deployed at:', escrow.address.toString());
    console.log('👉 Add this to your .env: VITE_ESCROW_CONTRACT_ADDRESS=' + escrow.address.toString());
}
