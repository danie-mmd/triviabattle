import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function run() {
    const apiKey = process.env.TONCENTER_API_KEY || 'c2f8486eae66cb48a5a4787bbdc3fbc8a4e268c484cf18eb6df7881ce0c9fa6d';
    const escrowAddrStr = 'EQBKkculywzSn0YoANE46b7VhPV_MalXQovHQ87Hjx51jiqB';
    const url = `https://toncenter.com/api/v2/getTransactions?address=${escrowAddrStr}&limit=20`;
    
    const res = await fetch(url, { headers: { 'X-API-Key': apiKey } });
    const body = await res.json();
    
    body.result.forEach((tx: any) => {
        const hash = tx.transaction_id.hash;
        if (hash === 'CvbZSBS269wUrThkOzy/xT2CqdJfUGMuQBa4rIJcFBg=') {
            console.log("TX 13:25 Found.");
            // In API v2, description is usually under 'transaction' or similar
            // Actually, let's just look at the bounce flag
            const inMsg = tx.in_msg;
            console.log("In Msg Bounceable:", inMsg?.bounce);
            
            // Check for exit code
            const desc = tx.description;
            if (desc && desc.compute_ph) {
                console.log("Exit Code:", desc.compute_ph.exit_code);
            } else {
                // Sometimes it's nested
                console.log("Raw desc:", JSON.stringify(desc));
            }
        }
    });
}
run();
