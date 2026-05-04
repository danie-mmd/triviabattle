import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function run() {
    const apiKey = 'c2f8486eae66cb48a5a4787bbdc3fbc8a4e268c484cf18eb6df7881ce0c9fa6d';
    const hash = 'VTgiBGL6aZj18eCGhkt6GF6zQjz37PVfODe4v8YFaYg=';
    const lt = '74502100000003';
    // Use toncenter v2 with archival=true which sometimes has more details
    const url = `https://toncenter.com/api/v2/getTransactions?address=EQDuTzpqHKV3FBT3-xGgeN6H_Qpn0ZSFQ5aiADjD3ssDrBGE&hash=${encodeURIComponent(hash)}&lt=${lt}&limit=1&archival=true`;
    
    const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
    const body = await res.json();
    if (body.ok && body.result[0]) {
        console.log("TX Details found.");
        console.log("Desc:", JSON.stringify(body.result[0].description, null, 2));
    }
}
run();
