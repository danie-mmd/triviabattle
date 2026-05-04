import { Cell } from '@ton/core';
const bocBase64 = 'te6cckEBAgEAEQABCCe0kSgBABAzODAyMTBhNsUaZ8c=';
const cell = Cell.fromBase64(bocBase64);
console.log('Cell Tree:');
console.log(cell.toString());
const slice = cell.beginParse();
const opcode = slice.loadUint(32);
console.log('Opcode (Hex):', opcode.toString(16));
if (slice.remainingBits >= 8) {
    try {
        const val = slice.loadStringRefTail();
        console.log('Decoded String:', val);
    } catch (e) {
        console.log('Failed to decode string:', e.message);
    }
}
