import { Cell } from '@ton/core';
import { Escrow } from './bindings/tact_Escrow';
import { Address } from '@ton/ton';

async function check() {
    const init = await Escrow.init(
        Address.parse('EQBWRc1cIHn-gnyNfPdWYYkbckIym3XbAweWTH-0Suk0jX25'),
        'test-room-410',
        BigInt('1000000000')
    );
    console.log('Local Code Hash:', init.code.hash().toString('hex'));
}
check();
