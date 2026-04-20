import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type Deposit = {
    $$type: 'Deposit';
}

export function storeDeposit(src: Deposit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1243991607, 32);
    };
}

export function loadDeposit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1243991607) { throw Error('Invalid prefix'); }
    return { $$type: 'Deposit' as const };
}

export function loadTupleDeposit(source: TupleReader) {
    return { $$type: 'Deposit' as const };
}

export function loadGetterTupleDeposit(source: TupleReader) {
    return { $$type: 'Deposit' as const };
}

export function storeTupleDeposit(source: Deposit) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserDeposit(): DictionaryValue<Deposit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeposit(src)).endCell());
        },
        parse: (src) => {
            return loadDeposit(src.loadRef().beginParse());
        }
    }
}

export type Payout = {
    $$type: 'Payout';
    winners: Dictionary<Address, bigint>;
}

export function storePayout(src: Payout) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2573352775, 32);
        b_0.storeDict(src.winners, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
    };
}

export function loadPayout(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2573352775) { throw Error('Invalid prefix'); }
    const _winners = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    return { $$type: 'Payout' as const, winners: _winners };
}

export function loadTuplePayout(source: TupleReader) {
    const _winners = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'Payout' as const, winners: _winners };
}

export function loadGetterTuplePayout(source: TupleReader) {
    const _winners = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'Payout' as const, winners: _winners };
}

export function storeTuplePayout(source: Payout) {
    const builder = new TupleBuilder();
    builder.writeCell(source.winners.size > 0 ? beginCell().storeDictDirect(source.winners, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    return builder.build();
}

export function dictValueParserPayout(): DictionaryValue<Payout> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePayout(src)).endCell());
        },
        parse: (src) => {
            return loadPayout(src.loadRef().beginParse());
        }
    }
}

export type Refund = {
    $$type: 'Refund';
}

export function storeRefund(src: Refund) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2910599901, 32);
    };
}

export function loadRefund(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2910599901) { throw Error('Invalid prefix'); }
    return { $$type: 'Refund' as const };
}

export function loadTupleRefund(source: TupleReader) {
    return { $$type: 'Refund' as const };
}

export function loadGetterTupleRefund(source: TupleReader) {
    return { $$type: 'Refund' as const };
}

export function storeTupleRefund(source: Refund) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserRefund(): DictionaryValue<Refund> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRefund(src)).endCell());
        },
        parse: (src) => {
            return loadRefund(src.loadRef().beginParse());
        }
    }
}

export type WithdrawDust = {
    $$type: 'WithdrawDust';
}

export function storeWithdrawDust(src: WithdrawDust) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2494890629, 32);
    };
}

export function loadWithdrawDust(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2494890629) { throw Error('Invalid prefix'); }
    return { $$type: 'WithdrawDust' as const };
}

export function loadTupleWithdrawDust(source: TupleReader) {
    return { $$type: 'WithdrawDust' as const };
}

export function loadGetterTupleWithdrawDust(source: TupleReader) {
    return { $$type: 'WithdrawDust' as const };
}

export function storeTupleWithdrawDust(source: WithdrawDust) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserWithdrawDust(): DictionaryValue<WithdrawDust> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawDust(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawDust(src.loadRef().beginParse());
        }
    }
}

export type Escrow$Data = {
    $$type: 'Escrow$Data';
    authorizedBackend: Address;
    roomId: string;
    entryFeeNano: bigint;
    deposits: Dictionary<Address, bigint>;
    depositCount: bigint;
    settled: boolean;
}

export function storeEscrow$Data(src: Escrow$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.authorizedBackend);
        b_0.storeStringRefTail(src.roomId);
        b_0.storeInt(src.entryFeeNano, 257);
        b_0.storeDict(src.deposits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeUint(src.depositCount, 8);
        b_0.storeBit(src.settled);
    };
}

export function loadEscrow$Data(slice: Slice) {
    const sc_0 = slice;
    const _authorizedBackend = sc_0.loadAddress();
    const _roomId = sc_0.loadStringRefTail();
    const _entryFeeNano = sc_0.loadIntBig(257);
    const _deposits = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_0);
    const _depositCount = sc_0.loadUintBig(8);
    const _settled = sc_0.loadBit();
    return { $$type: 'Escrow$Data' as const, authorizedBackend: _authorizedBackend, roomId: _roomId, entryFeeNano: _entryFeeNano, deposits: _deposits, depositCount: _depositCount, settled: _settled };
}

export function loadTupleEscrow$Data(source: TupleReader) {
    const _authorizedBackend = source.readAddress();
    const _roomId = source.readString();
    const _entryFeeNano = source.readBigNumber();
    const _deposits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _depositCount = source.readBigNumber();
    const _settled = source.readBoolean();
    return { $$type: 'Escrow$Data' as const, authorizedBackend: _authorizedBackend, roomId: _roomId, entryFeeNano: _entryFeeNano, deposits: _deposits, depositCount: _depositCount, settled: _settled };
}

export function loadGetterTupleEscrow$Data(source: TupleReader) {
    const _authorizedBackend = source.readAddress();
    const _roomId = source.readString();
    const _entryFeeNano = source.readBigNumber();
    const _deposits = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _depositCount = source.readBigNumber();
    const _settled = source.readBoolean();
    return { $$type: 'Escrow$Data' as const, authorizedBackend: _authorizedBackend, roomId: _roomId, entryFeeNano: _entryFeeNano, deposits: _deposits, depositCount: _depositCount, settled: _settled };
}

export function storeTupleEscrow$Data(source: Escrow$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.authorizedBackend);
    builder.writeString(source.roomId);
    builder.writeNumber(source.entryFeeNano);
    builder.writeCell(source.deposits.size > 0 ? beginCell().storeDictDirect(source.deposits, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.depositCount);
    builder.writeBoolean(source.settled);
    return builder.build();
}

export function dictValueParserEscrow$Data(): DictionaryValue<Escrow$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEscrow$Data(src)).endCell());
        },
        parse: (src) => {
            return loadEscrow$Data(src.loadRef().beginParse());
        }
    }
}

 type Escrow_init_args = {
    $$type: 'Escrow_init_args';
    authorizedBackend: Address;
    roomId: string;
    entryFeeNano: bigint;
}

function initEscrow_init_args(src: Escrow_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.authorizedBackend);
        b_0.storeStringRefTail(src.roomId);
        b_0.storeInt(src.entryFeeNano, 257);
    };
}

async function Escrow_init(authorizedBackend: Address, roomId: string, entryFeeNano: bigint) {
    const __code = Cell.fromHex('b5ee9c7241021e0100058d00022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d9010f020271020702015803050173b4cffda89a1a400031c2bf481a803a003020203ae01e809a60fa400aaa0d82d1c27f481a803a003020203ae00aa4007a2b0dae0e1c5b678d8c30040002200173b7b13da89a1a400031c2bf481a803a003020203ae01e809a60fa400aaa0d82d1c27f481a803a003020203ae00aa4007a2b0dae0e1c5b678d8c3006000224020120080d020148090b0173b07b7b513434800063857e903500740060404075c03d0134c1f48015541b05a384fe903500740060404075c0154800f4561b5c1c38b6cf1b18600a0008f8276f100173b0affb513434800063857e903500740060404075c03d0134c1f48015541b05a384fe903500740060404075c0154800f4561b5c1c38b6cf1b18600c0002210177bb915ed44d0d200018e15fa40d401d001810101d700f404d307d20055506c168e13fa40d401d001810101d700552003d1586d7070e25505db3c6c6180e004881010b24028101014133f40a6fa19401d70030925b6de2206eb395206ef2d080923070e204f601d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e15fa40d401d001810101d700f404d307d20055506c168e13fa40d401d001810101d700552003d1586d7070e207925f07e005d70d1ff2e0822182104a25ce37bae30221821099623f47bae302218210ad7c3addbae30221821094b502851013171b02f05b8171e726b3f2f48200f24d25c105f2f4f8416f24135f03814e805313bef2f4f84282008b9b2381010b238101014133f40a6fa19401d70030925b6de26ef2f481010b02810101216e955b59f4593098c801cf004133f441e204a488c88258c000000000000000000000000101cb67ccc970fb00103544031112001a000000004465706f7369746564003ac87f01ca0055505056ce03c8ce13cd810101cf00f400cb07ca00c9ed5402e631f404308200c241f84226c705f2f481165907b317f2f47f2681010b81010159f4826fa520965023d7003058966c216d326d01e2908ae85b3688c88258c000000000000000000000000101cb67ccc970fb0010355512c87f01ca0055505056ce03c8ce13cd810101cf00f400cb07ca00c9ed54141601b671708824553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0081010b28028101014133f4746fa520965023d7003058966c216d326d01e2150020000000005072697a65207061796f7574001600000000536574746c656402e05b8200c241f84225c705f2f481165906b316f2f47f2581010b81010159f4826fa520965023d7003058966c216d326d01e2908ae85b88c88258c000000000000000000000000101cb67ccc970fb001035443012c87f01ca0055505056ce03c8ce13cd810101cf00f400cb07ca00c9ed54181a01b671708824553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0081010b27028101014133f4746fa520965023d7003058966c216d326d01e219002800000000456e7472792066656520726566756e64001800000000526566756e64656402feba8e6f5b8200c241f84225c705f2f4816ff226f2f42370830670136d6d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010355512c87f01ca0055505056ce03c8ce13cd810101cf00f400cb07ca00c9ed54e0018210946a98b6bae3025f071c1d00b0d33f30c8018210aff90f5758cb1fcb3fc910461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055505056ce03c8ce13cd810101cf00f400cb07ca00c9ed540006f2c08216ae2190');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initEscrow_init_args({ $$type: 'Escrow_init_args', authorizedBackend, roomId, entryFeeNano })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const Escrow_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    5721: { message: "Already settled" },
    20096: { message: "Insufficient entry fee" },
    28658: { message: "Not yet settled" },
    29159: { message: "Game already settled" },
    35739: { message: "Already deposited" },
    49729: { message: "Unauthorized" },
    62029: { message: "Room is full" },
} as const

export const Escrow_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Already settled": 5721,
    "Insufficient entry fee": 20096,
    "Not yet settled": 28658,
    "Game already settled": 29159,
    "Already deposited": 35739,
    "Unauthorized": 49729,
    "Room is full": 62029,
} as const

const Escrow_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Deposit","header":1243991607,"fields":[]},
    {"name":"Payout","header":2573352775,"fields":[{"name":"winners","type":{"kind":"dict","key":"address","value":"int"}}]},
    {"name":"Refund","header":2910599901,"fields":[]},
    {"name":"WithdrawDust","header":2494890629,"fields":[]},
    {"name":"Escrow$Data","header":null,"fields":[{"name":"authorizedBackend","type":{"kind":"simple","type":"address","optional":false}},{"name":"roomId","type":{"kind":"simple","type":"string","optional":false}},{"name":"entryFeeNano","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"deposits","type":{"kind":"dict","key":"address","value":"int"}},{"name":"depositCount","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"settled","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const Escrow_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "Deposit": 1243991607,
    "Payout": 2573352775,
    "Refund": 2910599901,
    "WithdrawDust": 2494890629,
}

const Escrow_getters: ABIGetter[] = [
    {"name":"prizePool","methodId":98797,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"depositCount","methodId":103103,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isSettled","methodId":83583,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"getDeposit","methodId":129301,"arguments":[{"name":"addr","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"roomId","methodId":97673,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
]

export const Escrow_getterMapping: { [key: string]: string } = {
    'prizePool': 'getPrizePool',
    'depositCount': 'getDepositCount',
    'isSettled': 'getIsSettled',
    'getDeposit': 'getGetDeposit',
    'roomId': 'getRoomId',
}

const Escrow_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"Deposit"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Payout"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Refund"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawDust"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class Escrow implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = Escrow_errors_backward;
    public static readonly opcodes = Escrow_opcodes;
    
    static async init(authorizedBackend: Address, roomId: string, entryFeeNano: bigint) {
        return await Escrow_init(authorizedBackend, roomId, entryFeeNano);
    }
    
    static async fromInit(authorizedBackend: Address, roomId: string, entryFeeNano: bigint) {
        const __gen_init = await Escrow_init(authorizedBackend, roomId, entryFeeNano);
        const address = contractAddress(0, __gen_init);
        return new Escrow(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new Escrow(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Escrow_types,
        getters: Escrow_getters,
        receivers: Escrow_receivers,
        errors: Escrow_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: Deposit | Payout | Refund | WithdrawDust | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deposit') {
            body = beginCell().store(storeDeposit(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Payout') {
            body = beginCell().store(storePayout(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Refund') {
            body = beginCell().store(storeRefund(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawDust') {
            body = beginCell().store(storeWithdrawDust(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getPrizePool(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('prizePool', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getDepositCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('depositCount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsSettled(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('isSettled', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetDeposit(provider: ContractProvider, addr: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(addr);
        const source = (await provider.get('getDeposit', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getRoomId(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('roomId', builder.build())).stack;
        const result = source.readString();
        return result;
    }
    
}