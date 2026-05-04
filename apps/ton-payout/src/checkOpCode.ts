import { crc32 } from './utils/crc32'; // Wait, I might not have this util

// Actually, I'll just use a small piece of code to compute crc32 of "Reset"
function crc32_str(str: string): number {
    const buffer = Buffer.from(str);
    let crc = 0xFFFFFFFF;
    const table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
        let r = i;
        for (let j = 0; j < 8; j++) {
            r = (r & 1) ? (r >>> 1) ^ 0xEDB88320 : (r >>> 1);
        }
        table[i] = r;
    }
    for (let i = 0; i < buffer.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

console.log('CRC32 of Reset:', crc32_str('Reset'));
console.log('CRC32 of Refund:', crc32_str('Refund'));
