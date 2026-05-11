import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole, requireBaseAccess } from '../middleware/auth';
import { 
  getAssetsForBase, 
  createAsset, 
  recordPurchase, 
  recordTransfer,
  recordAssignment,
  recordExpenditure,
  getClosingBalance
} from '../services/assetService';

const router = Router();

// Get assets for a base
router.get('/assets', authMiddleware, requireBaseAccess, async (req: Request, res: Response) => {
  try {
    const { base_id, equipment_type } = req.query;
    const assets = await getAssetsForBase(base_id as string, equipment_type as string);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create asset
router.post('/assets', authMiddleware, requireRole('admin', 'base_commander'), async (req: Request, res: Response) => {
  try {
    const { base_id, name, type, opening_balance } = req.body;
    const asset = await createAsset(
      base_id,
      name,
      type,
      opening_balance,
      (req as any).auth.userId,
      req.ip || ''
    );
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get closing balance for asset
router.get('/assets/:asset_id/balance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const balance = await getClosingBalance(req.params.asset_id);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Record purchase
router.post('/purchases', authMiddleware, requireRole('admin', 'base_commander', 'logistics_officer'), async (req: Request, res: Response) => {
  try {
    const { asset_id, base_id, quantity, unit_price } = req.body;
    const purchase = await recordPurchase(
      asset_id,
      base_id,
      quantity,
      unit_price,
      (req as any).auth.userId,
      req.ip || ''
    );
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Record transfer
router.post('/transfers', authMiddleware, requireRole('admin', 'base_commander', 'logistics_officer'), async (req: Request, res: Response) => {
  try {
    const { asset_id, from_base_id, to_base_id, quantity } = req.body;
    const transfer = await recordTransfer(
      asset_id,
      from_base_id,
      to_base_id,
      quantity,
      (req as any).auth.userId,
      req.ip || ''
    );
    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Record assignment
router.post('/assignments', authMiddleware, requireRole('admin', 'base_commander'), async (req: Request, res: Response) => {
  try {
    const { asset_id, personnel_name, quantity } = req.body;
    const assignment = await recordAssignment(
      asset_id,
      personnel_name,
      quantity,
      (req as any).auth.userId,
      req.ip || ''
    );
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Record expenditure
router.post('/expenditures', authMiddleware, requireRole('admin', 'base_commander'), async (req: Request, res: Response) => {
  try {
    const { asset_id, quantity, reason } = req.body;
    const expenditure = await recordExpenditure(
      asset_id,
      quantity,
      reason,
      (req as any).auth.userId,
      req.ip || ''
    );
    res.status(201).json(expenditure);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
