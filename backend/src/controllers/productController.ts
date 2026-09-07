import { NextFunction, Request, Response } from 'express';
import { Product } from '../models/Product';

const requireTenant = (req: Request, res: Response): string | undefined => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    res.status(403).json({ success: false, message: 'Tenant context required' });
    return undefined;
  }
  return tenantId;
};

const stripTenant = (body: Record<string, unknown>) => {
  const { tenantId: _tenantId, tenant_id: _tenant_id, ...data } = body;
  return data;
};

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId.trim() : '';
    const page = Math.max(Number.parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || '50'), 10), 1), 100);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { tenantId, isActive: true };
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { sku: regex }, { barcode: regex }, { description: regex }];
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const product = await Product.findOne({ _id: req.params.id, tenantId, isActive: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const product = await Product.create({
      ...stripTenant(req.body),
      tenantId,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      stripTenant(req.body),
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Product archived successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const product = await Product.findOne({ _id: req.params.id, tenantId, isActive: true });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const products = [];
    for (const update of req.body.updates as Array<{ id: string; data: Record<string, unknown> }>) {
      const product = await Product.findOneAndUpdate(
        { _id: update.id, tenantId },
        stripTenant(update.data),
        { new: true, runValidators: true }
      );
      if (product) products.push(product);
    }

    res.json({ success: true, data: products, products });
  } catch (error) {
    next(error);
  }
};

export const importProducts = (_req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: 'Product import requires file processing configuration and is not enabled yet',
  });
};

export const exportProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = requireTenant(req, res);
    if (!tenantId) return;

    const products = await Product.find({ tenantId, isActive: true }).sort({ name: 1 });
    const rows = [
      'name,sku,barcode,unit,cost,price,taxRate',
      ...products.map((product) => [
        product.name,
        product.sku,
        product.barcode || '',
        product.unit,
        product.cost,
        product.price,
        product.taxRate,
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.send(rows.join('\n'));
  } catch (error) {
    next(error);
  }
};
