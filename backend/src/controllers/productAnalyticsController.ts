import { Request, Response } from 'express';

export const getProductAnalytics = async (req: Request, res: Response) => {
  try {
    // Mock analytics data for now - replace with real DB queries
    const analytics = {
      totalProducts: 157,
      totalValue: 45890.50,
      lowStockCount: 12,
      outOfStockCount: 5,
      topCategories: [
        { name: 'Beverages', count: 45, value: 12500.00 },
        { name: 'Bakery', count: 32, value: 8900.50 },
        { name: 'Snacks', count: 28, value: 5600.75 },
      ],
      recentActivity: [
        { type: 'added', product: 'Espresso', quantity: 50, date: new Date() },
        { type: 'sold', product: 'Croissant', quantity: 12, date: new Date() },
      ],
      stockAlerts: [
        { product: 'Croissant', current: 3, threshold: 10 },
        { product: 'Muffin', current: 5, threshold: 15 },
      ]
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product analytics'
    });
  }
};
