import { Router } from 'express';
import { crudRoutes } from '../../core/utils/routeFactory.js';
import { writeAuditLog } from '../../core/audit/audit.service.js';
import { Vendor, VendorGroup, VendorPurchase, VendorRefund, VendorTransfer } from './vendor.models.js';
import { completeVendorPurchase, completeVendorRefund, completeVendorTransfer } from './vendor.service.js';
const router = Router();
router.use('/vendors', crudRoutes(Vendor));
router.use('/groups', crudRoutes(VendorGroup));
router.use('/purchases', crudRoutes(VendorPurchase));
router.use('/refunds', crudRoutes(VendorRefund));
router.use('/transfers', crudRoutes(VendorTransfer));
router.post('/purchases/:id/complete', async (req, res) => {
  const item = await completeVendorPurchase(req.params.id);
  await writeAuditLog(req, { action: 'vendor_purchase.complete', module: 'vendor', resource: 'VendorPurchase', resourceId: item.id, after: item });
  res.json(item);
});
router.post('/refunds/:id/complete', async (req, res) => {
  const item = await completeVendorRefund(req.params.id);
  await writeAuditLog(req, { action: 'vendor_refund.complete', module: 'vendor', resource: 'VendorRefund', resourceId: item.id, after: item });
  res.json(item);
});
router.post('/transfers/:id/complete', async (req, res) => {
  const item = await completeVendorTransfer(req.params.id);
  await writeAuditLog(req, { action: 'vendor_transfer.complete', module: 'vendor', resource: 'VendorTransfer', resourceId: item.id, after: item });
  res.json(item);
});
export default router;
