import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function run() {
    const apiKey = process.env.TONCENTER_API_KEY || 'c2f8486eae66cb48a5a4787bbdc3fbc8a4e268c484cf18eb6df7881ce0c9fa6d';
    const escrowAddrStr = 'EQDuTzpqHKV3FBT3-xGgeN6H_Qpn0ZSFQ5aiADjD3ssDrBGE';
    const url = `https://toncenter.com/api/v2/getTransactions?address=${escrowAddrStr}&limit=5`;
    
    const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
    const body = await res.json();
    
    const successTx = body.result.find((tx: any) => tx.transaction_id.hash === 'osqX19vKWCGe27qJ4ZSYbyTq9+oct6Ak+2kdA+HyCOk=');
    if (successTx) {
        console.log("SUCCESS TX 09:34 DETAIL:");
        console.log("IN MSG BODY (Hex):", Buffer.from(successTx.in_msg.msg_data.body, 'base64').toString('hex'));
    }
}
run();
