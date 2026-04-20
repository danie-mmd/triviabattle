import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { executePayout, executeRefund, executeReset } from './payout';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/payout', async (req, res) => {
    try {
        const { roomId, winnerId, walletAddress, prizeTon, feeTon } = req.body;

        if (!roomId || typeof prizeTon !== 'number') {
            return res.status(400).json({ error: 'Missing or invalid parameters' });
        }

        console.log(`[Ton Payout] Received payout request for Room ${roomId}, Prize: ${prizeTon}, Fee: ${feeTon}`);
        const txHash = await executePayout(walletAddress, prizeTon, feeTon || 0);

        return res.json({ success: true, message: 'Payout triggered successfully', txHash });
    } catch (error: any) {
        console.error(`[Ton Payout] Error triggering payout:`, error.message);
        return res.status(500).json({ error: 'Failed to execute payout' });
    }
});

app.post('/api/refund', async (req, res) => {
    try {
        const { roomId } = req.body;
        console.log(`[Ton Payout] Received refund request for Room ${roomId}`);
        
        const { executeRefund } = await import('./payout');
        const txHash = await executeRefund();

        return res.json({ success: true, message: 'Refund triggered successfully', txHash });
    } catch (error: any) {
        console.error(`[Ton Payout] Error triggering refund:`, error.message);
        return res.status(500).json({ error: 'Failed to execute refund' });
    }
});

app.post('/api/reset', async (req, res) => {
    try {
        const { roomId } = req.body;
        if (!roomId) return res.status(400).json({ error: 'Missing roomId' });

        console.log(`[Ton Payout] Received reset request for New Room ${roomId}`);
        const txHash = await executeReset(roomId);

        return res.json({ success: true, message: 'Reset triggered successfully', txHash });
    } catch (error: any) {
        console.error(`[Ton Payout] Error triggering reset:`, error.message);
        return res.status(500).json({ error: 'Failed to execute reset' });
    }
});


app.listen(PORT, () => {
    console.log(`[Ton Payout Service] Listening on port ${PORT}`);
});
