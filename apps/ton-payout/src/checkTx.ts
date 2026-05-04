import { TonClient, Address } from '@ton/ton';
import dotenv from 'dotenv';
import path from 'path';

// Force load absolute path .env.production if it exists
const envPath = path.resolve(__dirname, '../../../../.env.production');
dotenv.config({ path: envPath });

async function checkFailedTransaction() {
    const apiKey = process.env.TONCENTER_API_KEY;
    if (!apiKey) {
        console.error("Missing TONCENTER_API_KEY environment variable");
        return;
    }

    const escrowAddrStr = 'EQBKkculywzSn0YoANE46b7VhPV_MalXQovHQ87Hjx51jiqB';
    const escrowAddr = Address.parse(escrowAddrStr);
    
    console.log(`Fetching recent transactions for Escrow: ${escrowAddr.toString()}`);
    
    // Using fetch directly to avoid dependency issues
    const url = `https://toncenter.com/api/v2/getTransactions?address=${escrowAddr.toString()}&limit=20`;
    
    try {
        const res = await fetch(url, {
            headers: {
                'X-API-Key': apiKey
            }
        });

        const body = await res.json();
        if (!body.ok) {
            console.error("TonCenter API Error:", body);
            return;
        }

        if (body.result.length === 0) {
            console.log("No transactions found for this address on Mainnet.");
            return;
        }

        body.result.forEach((tx: any) => {
            const utime = tx.utime;
            const date = new Date(utime * 1000).toLocaleString();
            const inMsg = tx.in_msg;
            const compute = tx.compute_phase;
            
            let source = "Unknown";
            let value = 0;
            if (inMsg) {
                source = inMsg.source || "External";
                value = Number(inMsg.value || 0) / 1e9;
            }

            console.log(`Date: ${date} | Hash: ${tx.transaction_id.hash}`);
            console.log(`   Source: ${source}`);
            console.log(`   Value: ${value} TON`);
            
            if (compute) {
                console.log(`   Execution Success: ${compute.success}`);
                if (!compute.success) {
                    console.log(`   --> EXIT CODE: ${compute.exit_code}`);
                    console.log(`   --> VM LOGS: ${tx.description?.compute_ph?.vm_log || 'N/A'}`);
                }
            } else {
                console.log(`   No compute phase.`);
            }
            
            if (tx.out_msgs && tx.out_msgs.length > 0) {
                tx.out_msgs.forEach((out: any) => {
                    console.log(`   Out Msg to: ${out.destination} | Value: ${Number(out.value)/1e9} TON`);
                });
            }
            console.log('---');
        });
    } catch (e: any) {
        console.error("Failed to fetch transactions:", e.message);
    }
}

checkFailedTransaction().catch(console.error);
