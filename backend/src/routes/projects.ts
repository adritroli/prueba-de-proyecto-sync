import { Router } from 'express';
import { getProjectsSummary } from '../controllers/projectsController';
import { verifyToken } from '../middlewares/authMiddleware';
import { RequestHandler } from 'express';

const router = Router();

router.get('/summary', verifyToken as RequestHandler, getProjectsSummary);

export default router;
