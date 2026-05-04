import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function run() {
    const apiKey = process.env.TONCENTER_API_KEY || 'c2f8486eae66cb48a5a4787bbdc3fbc8a4e268c484cf18eb6df7881ce0c9fa6d';
    const escrowAddrStr = 'EQDuTzpqHKV3FBT3-xGgeN6H_Qpn0ZSFQ5aiADjD3ssDrBGE';
    const limit = 10;
    const url = `https://toncenter.com/api/v2/getTransactions?address=${escrowAddrStr}&limit=${limit}`;
    
    const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
    const body = await res.json();
    
    const failTx = body.result.find((tx: any) => tx.transaction_id.hash === 'VTgiBGL6aZj18eCGhkt6GF6zQjz37PVfODe4v8YFaYg=');
    if (failTx) {
        console.log(JSON.stringify(failTx, null, 2));
    } else {
        console.log("Failed TX not found.");
    }
}
run();
