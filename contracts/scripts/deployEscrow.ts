import { toNano, Address } from '@ton/core';
import { Escrow } from '../wrappers/Escrow';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    // AUTHORIZED_BACKEND must be set in .env (see contracts/.env.production)
    const backendAddr = process.env.AUTHORIZED_BACKEND || process.env.AUTHORIZED_BACKEND_ADDRESS;
    if (!backendAddr) {
        throw new Error('Set AUTHORIZED_BACKEND in contracts/.env.production before deploying!');
    }
    const authorizedBackend = Address.parse(backendAddr);
    const entryFee = toNano(process.env.ENTRY_FEE_TON || '1.0');

    // Use a unique initial roomId so the contract starts in a fresh, non-settled state.
    const roomId = 'init-' + Date.now();

    console.log('Deploying Escrow with:');
    console.log('  authorizedBackend:', authorizedBackend.toString());
    console.log('  roomId (initial):', roomId);
    console.log('  entryFee:', entryFee.toString(), 'nanoTON');

    const escrow = provider.open(await Escrow.fromInit(authorizedBackend, roomId, entryFee));

    await escrow.send(
        provider.sender(),
        { value: toNano('0.05') }, // deployment gas (~0.05 TON)
        { $$type: 'Deploy', queryId: 0n }
    );

    await provider.waitForDeploy(escrow.address);
    console.log('\n✅ Escrow deployed at:', escrow.address.toString());
    console.log('👉 Paste this address everywhere:');
    console.log('   Frontend: VITE_ESCROW_CONTRACT_ADDRESS=' + escrow.address.toString());
    console.log('   Secret Manager: gcloud secrets versions add ESCROW_CONTRACT_ADDRESS --data-file=<(echo -n \''+escrow.address.toString()+'\')' );
}
