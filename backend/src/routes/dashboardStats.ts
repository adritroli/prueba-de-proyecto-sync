import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardStatsController';
import { verifyToken } from '../middlewares/authMiddleware';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get('/stats', verifyToken as RequestHandler, asyncHandler(getDashboardStats));

export default router;
