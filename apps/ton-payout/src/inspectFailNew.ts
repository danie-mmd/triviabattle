import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function run() {
    const apiKey = process.env.TONCENTER_API_KEY || 'c2f8486eae66cb48a5a4787bbdc3fbc8a4e268c484cf18eb6df7881ce0c9fa6d';
    const escrowAddrStr = 'EQDuTzpqHKV3FBT3-xGgeN6H_Qpn0ZSFQ5aiADjD3ssDrBGE';
    const url = `https://toncenter.com/api/v2/getTransactions?address=${escrowAddrStr}&limit=10`;
    
    const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
    const body = await res.json();
    
    body.result.forEach((tx: any) => {
        const utime = tx.utime;
        const date = new Date(utime * 1000).toLocaleString();
        const value = Number(tx.in_msg?.value || 0) / 1e9;
        const source = tx.in_msg?.source;
        
        // Check for out messages (bounces)
        const isBounce = tx.out_msgs && tx.out_msgs.length > 0 && tx.out_msgs[0].destination === source && Number(tx.out_msgs[0].value) > 0;
        
        console.log(`Date: ${date} | Hash: ${tx.transaction_id.hash}`);
        console.log(`   Source: ${source} | Value: ${value} TON`);
        
        if (isBounce) {
            console.log(`   --> BOUNCED back to source!`);
        }
    });
}
run();
