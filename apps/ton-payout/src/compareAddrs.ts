import { Address } from '@ton/ton';
const addr1 = Address.parse('UQBWRc1cIHn-gnyNfPdWYYkbckIym3XbAweWTH-0Suk0jSB8');
const addr2 = Address.parse('EQBWRc1cIHn-gnyNfPdWYYkbckIym3XbAweWTH-0Suk0jX25');
console.log('Addr1 Hex:', addr1.toRawString());
console.log('Addr2 Hex:', addr2.toRawString());
console.log('Match:', addr1.toRawString() === addr2.toRawString());
