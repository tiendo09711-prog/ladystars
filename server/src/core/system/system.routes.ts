import { Router } from 'express';
import { crudRoutes } from '../utils/routeFactory.js';
import { MenuItem, Permission, Role } from './system.models.js';
import { Branch } from '../org/branch.model.js';

const router = Router();
router.use('/permissions', crudRoutes(Permission));
router.use('/roles', crudRoutes(Role));
router.use('/menus', crudRoutes(MenuItem));
router.use('/branches', crudRoutes(Branch));

export default router;
