import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';

export const getProductAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(403).json({ success: false, message: 'Tenant context required' });
      return;
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const [totalProducts, totalValueResult, lowStockCount] = await Promise.all([
      Product.countDocuments({ tenantId: tenantObjectId, isActive: true }),
      Product.aggregate([
        { $match: { tenantId: tenantObjectId, isActive: true } },
        { $group: { _id: null, totalValue: { $sum: '$price' } } },
      ]),
      Product.countDocuments({ tenantId: tenantObjectId, isActive: true, reorderLevel: { $exists: true, $lte: 10 } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalValue: totalValueResult[0]?.totalValue || 0,
        lowStockCount,
        outOfStockCount: 0,
        topCategories: [],
        recentActivity: [],
        stockAlerts: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product analytics',
    });
  }
};
