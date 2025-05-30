import { Router } from 'express';
import { getDashboardConfig, saveDashboardConfig } from '../controllers/dashboardConfigController';
import { verifyToken, AuthRequest } from '../middlewares/authMiddleware';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const router = Router();

const asyncHandler = (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };

router.get('/config', verifyToken as RequestHandler, asyncHandler(getDashboardConfig));
router.post('/config', verifyToken as RequestHandler, asyncHandler(saveDashboardConfig));

export default router;
