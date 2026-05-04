import { TonClient, Address } from '@ton/ton';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function checkFailedTransaction() {
    const apiKey = process.env.TONCENTER_API_KEY || 'c2f8486eae66cb48a5a4787bbdc3fbc8a4e268c484cf18eb6df7881ce0c9fa6d';
    const escrowAddrStr = 'EQBKkculywzSn0YoANE46b7VhPV_MalXQovHQ87Hjx51jiqB';
    const escrowAddr = Address.parse(escrowAddrStr);
    
    const url = `https://toncenter.com/api/v2/getTransactions?address=${escrowAddr.toString()}&limit=20`;
    
    try {
        const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
        const body = await res.json();
        if (!body.ok) return;

        body.result.forEach((tx: any) => {
            const utime = tx.utime;
            const date = new Date(utime * 1000).toLocaleString();
            
            // Look for 13:25 (roughly UTC 11:25)
            // My local date might be different, let's just show all recent fails
            const compute = tx.description?.compute_ph;
            const action = tx.description?.action_ph;
            const bounce = tx.description?.bounce_ph;

            if (tx.transaction_id.hash === 'CvbZSBS269wUrThkOzy/xT2CqdJfUGMuQBa4rIJcFBg=') {
                 console.log("FOUND 13:25 FAIL TX DETAIL:");
                 console.log(JSON.stringify(tx.description, null, 2));
                 console.log("IN MSG BODY:", tx.in_msg?.message_data?.body);
            }
        });
    } catch (e: any) {
        console.error("Failed:", e.message);
    }
}

checkFailedTransaction().catch(console.error);
