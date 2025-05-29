import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();

// Proteger la ruta con autenticación
router.get('/stats', authenticateToken as any, getDashboardStats);

export default router;
