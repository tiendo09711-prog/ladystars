import { Router } from 'express';
import { crudRoutes } from '../../core/utils/routeFactory.js';
import { 
  InventoryVoucher, 
  InventoryProduct, 
  WarehouseTransfer,
  InventoryCheck,
  InventoryCheckProduct
} from './warehouse.models.js';

const router = Router();

router.use('/vouchers', crudRoutes(InventoryVoucher));
router.use('/products', crudRoutes(InventoryProduct));
router.use('/transfers', crudRoutes(WarehouseTransfer));
router.use('/checks', crudRoutes(InventoryCheck));
router.use('/check-products', crudRoutes(InventoryCheckProduct));

export default router;
