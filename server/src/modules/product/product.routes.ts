import { Router } from 'express';
import { crudRoutes } from '../../core/utils/routeFactory.js';
import { writeAuditLog } from '../../core/audit/audit.service.js';
import { Category, DeliveryPartner, PaymentMethod, Product, ProductBranchStock, ProductLog, ProductRefund, SaleChannel, SalePayment, Shelf, StockAdjustment, Trademark } from './product.models.js';
import { completeProductRefund, completeSalePayment, completeStockAdjustment } from './product.service.js';

const router = Router();
router.use('/categories', crudRoutes(Category));
router.use('/trademarks', crudRoutes(Trademark));
router.use('/shelves', crudRoutes(Shelf));
router.use('/products', crudRoutes(Product));
router.use('/branch-stocks', crudRoutes(ProductBranchStock));
router.use('/sale-channels', crudRoutes(SaleChannel));
router.use('/delivery-partners', crudRoutes(DeliveryPartner));
router.use('/payment-methods', crudRoutes(PaymentMethod));
router.use('/stock-adjustments', crudRoutes(StockAdjustment));
router.use('/sales', crudRoutes(SalePayment));
router.use('/refunds', crudRoutes(ProductRefund));
router.use('/logs', crudRoutes(ProductLog));
router.post('/sales/:id/complete', async (req, res) => {
  const item = await completeSalePayment(req.params.id);
  await writeAuditLog(req, { action: 'sales.complete', module: 'sales', resource: 'SalePayment', resourceId: item.id, after: item });
  res.json(item);
});
router.post('/refunds/:id/complete', async (req, res) => {
  const item = await completeProductRefund(req.params.id);
  await writeAuditLog(req, { action: 'sales_refund.complete', module: 'sales', resource: 'ProductRefund', resourceId: item.id, after: item });
  res.json(item);
});
router.post('/stock-adjustments/:id/complete', async (req, res) => {
  const item = await completeStockAdjustment(req.params.id);
  await writeAuditLog(req, { action: 'stock_adjustment.complete', module: 'inventory', resource: 'StockAdjustment', resourceId: item.id, after: item });
  res.json(item);
});
export default router;
