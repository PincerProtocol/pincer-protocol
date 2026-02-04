import { Router, Request, Response } from 'express';
import { blockchainService } from '../services/blockchain';

const router = Router();

// GET /health
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const contractInfo = await blockchainService.getContractInfo();
    const tokenInfo = await blockchainService.getTokenInfo();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      contracts: {
        token: {
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
        },
        escrow: {
          feeRate: contractInfo.feeRate,
          escrowDuration: contractInfo.escrowDuration,
          totalTransactions: contractInfo.transactionCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /balance/:address
router.get('/balance/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }
    const balance = await blockchainService.getBalance(address);
    res.json({
      address,
      balance: balance.formatted,
      raw: balance.balance,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow
router.post('/escrow', async (req: Request, res: Response) => {
  try {
    const { receiver, seller, amount, memo } = req.body;
    const sellerAddress = seller || receiver; // support both field names

    if (!sellerAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields: receiver/seller, amount' });
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(sellerAddress)) {
      return res.status(400).json({ error: 'Invalid receiver/seller address format' });
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const result = await blockchainService.createEscrow(sellerAddress, amount, memo);
    if (result.success) {
      res.status(201).json({
        success: true,
        escrowId: result.escrowId,
        txHash: result.txHash,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:txId
router.get('/escrow/:txId', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const escrow = await blockchainService.getEscrow(escrowId);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json(escrow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:txId/confirm
router.post('/escrow/:txId/confirm', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const result = await blockchainService.confirmEscrow(escrowId);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:txId/cancel
router.post('/escrow/:txId/cancel', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const result = await blockchainService.cancelEscrow(escrowId);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:txId/claim - Seller submits delivery proof
router.post('/escrow/:txId/claim', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const result = await blockchainService.submitDeliveryProof(escrowId);
    if (result.success) {
      res.json({ 
        success: true, 
        txHash: result.txHash,
        message: 'Delivery proof submitted. Auto-complete available in 24h if buyer does not respond.'
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:txId/auto-complete - Auto-complete after 24h
router.post('/escrow/:txId/auto-complete', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const result = await blockchainService.autoComplete(escrowId);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /escrow/:txId/dispute - Open a dispute
router.post('/escrow/:txId/dispute', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const result = await blockchainService.openDispute(escrowId);
    if (result.success) {
      res.json({ 
        success: true, 
        txHash: result.txHash,
        message: 'Dispute opened. Funds are locked pending resolution.'
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /escrow/:txId/status - Get detailed escrow status
router.get('/escrow/:txId/status', async (req: Request, res: Response) => {
  try {
    const escrowId = parseInt(req.params.txId);
    if (isNaN(escrowId) || escrowId <= 0) {
      return res.status(400).json({ error: 'Invalid escrow ID' });
    }

    const status = await blockchainService.getEscrowStatus(escrowId);
    if (!status) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /agents/:address/history
router.get('/agents/:address/history', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    const history = await blockchainService.getAgentHistory(address);
    res.json({
      address,
      count: history.length,
      transactions: history,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
