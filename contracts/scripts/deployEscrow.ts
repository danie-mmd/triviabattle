import { toNano, Address } from '@ton/core';
import { Escrow } from '../wrappers/Escrow';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // Load from environment or fallback to test defaults
    const authorizedBackend = Address.parse(process.env.AUTHORIZED_BACKEND_ADDRESS || "0QCgZK_3KBYQy5r3qTpMC2Q_qFI_9gZ71chvqrX5BeVvDSxP");
    const entryFee = toNano(process.env.ENTRY_FEE_TON || '1.0');

    //const roomId = "test-room-" + Math.floor(Math.random() * 1000);
    const roomId = "trivia-battle-prod-1";

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
