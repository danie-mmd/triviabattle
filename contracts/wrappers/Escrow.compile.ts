import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'Escrow.tact',
    options: {
        debug: true,
    },
};
