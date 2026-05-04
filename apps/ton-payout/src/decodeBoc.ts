import { Cell } from '@ton/core';
const bocHex = 'b5ee9c72410101010006000008ad7c3addcff5e1bc';
const cell = Cell.fromHex(bocHex);
const slice = cell.beginParse();
const opcode = slice.loadUint(32);
console.log('Opcode (Dec):', opcode);
console.log('Opcode (Hex):', opcode.toString(16));
