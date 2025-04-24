import { Router } from 'express';
import { login, getRoles, getModules, getRolePermissions, updateRolePermissions } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.get('/roles', getRoles);
router.get('/modules', getModules);
router.get('/roles/:roleId/permissions', getRolePermissions);
router.put('/roles/:roleId/permissions', updateRolePermissions);

export default router;
