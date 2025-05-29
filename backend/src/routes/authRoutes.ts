import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/roles', authController.getRoles);
router.get('/modules', authController.getModules);
router.get('/roles/:roleId/permissions', authController.getRolePermissions);
router.put('/roles/:roleId/permissions', authController.updateRolePermissions);

export default router;
