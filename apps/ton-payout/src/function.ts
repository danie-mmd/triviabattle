import * as functions from '@google-cloud/functions-framework';
import express from 'express';
import cors from 'cors';
import { executePayout, executeRefund, executeReset, executeWithdrawDust } from './payout';

const app = express();
app.use(cors());
app.use(express.json());

// Path-based routing within the Cloud Function
app.post('/payout', async (req, res) => {
    try {
        const { roomId, winnerId, walletAddress, prizeTon, feeTon } = req.body;
        if (!roomId || typeof prizeTon !== 'number') {
            return res.status(400).json({ error: 'Missing parameters' });
        }
        const txHash = await executePayout(walletAddress, prizeTon, feeTon || 0);
        res.json({ success: true, txHash });
    } catch (error: any) {
        console.error('[Ton Payout] Payout error:', error)
        res.status(500).json({ error: error.message });
    }
});

app.post('/refund', async (req, res) => {
    try {
        const txHash = await executeRefund();
        res.json({ success: true, txHash });
    } catch (error: any) {
        console.error('[Ton Payout] Refund error:', error)
        res.status(500).json({ error: error.message });
    }
});

app.post('/reset', async (req, res) => {
    try {
        const { roomId } = req.body;
        const txHash = await executeReset(roomId);
        res.json({ success: true, txHash });
    } catch (error: any) {
        console.error('[Ton Payout] Reset error:', error)
        res.status(500).json({ error: error.message });
    }
});

app.post('/withdraw-dust', async (req, res) => {
    try {
        const txHash = await executeWithdrawDust();
        res.json({ success: true, txHash });
    } catch (error: any) {
        console.error('[Ton Payout] Dust withdrawal error:', error)
        res.status(500).json({ error: error.message });
    }
});

// Register the Express app as a Cloud Function
functions.http('tonPayoutFunction', app);
