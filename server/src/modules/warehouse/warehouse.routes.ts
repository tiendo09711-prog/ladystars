import { Router } from 'express';
import { crudRoutes } from '../../core/utils/routeFactory.js';
import { InventoryVoucher, InventoryProduct, WarehouseTransfer } from './warehouse.models.js';

const router = Router();

router.use('/vouchers', crudRoutes(InventoryVoucher));
router.use('/products', crudRoutes(InventoryProduct));
router.use('/transfers', crudRoutes(WarehouseTransfer));

export default router;
