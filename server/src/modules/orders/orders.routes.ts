import { Router } from 'express';
import { crudRoutes } from '../../core/utils/routeFactory.js';
import {
  Order,
  OrderDuplicate,
  OrderPackaging,
  OrderHandover,
  OrderShippingPending,
  OrderDispute,
  OrderCodControl,
  OrderSource,
  OrderHistory,
} from './orders.models.js';

const router = Router();

router.use('/manage', crudRoutes(Order));
router.use('/duplicates', crudRoutes(OrderDuplicate));
router.use('/packaging', crudRoutes(OrderPackaging));
router.use('/handover', crudRoutes(OrderHandover));
router.use('/shipping-pending', crudRoutes(OrderShippingPending));
router.use('/disputes', crudRoutes(OrderDispute));
router.use('/cod-control', crudRoutes(OrderCodControl));
router.use('/sources', crudRoutes(OrderSource));
router.use('/history', crudRoutes(OrderHistory));

export default router;
