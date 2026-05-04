import { Escrow } from './bindings/tact_Escrow';
import { Address, contractAddress } from '@ton/ton';

async function check() {
    const init = await Escrow.init(
        Address.parse('EQBWRc1cIHn-gnyNfPdWYYkbckIym3XbAweWTH-0Suk0jX25'),
        'test-room-410',
        BigInt('1000000000')
    );
    const addr = contractAddress(0, init);
    console.log('Deterministic Address for Local Code:', addr.toString());
}
check();
