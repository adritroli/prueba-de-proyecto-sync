import  { Router } from 'express';
import { 
    getBoards,
    getBoardDetails,
} from '../controllers/kanbanBoardController';

const router = Router();

router.get('/prueba', getBoards);
router.get('/tucola/:id', getBoardDetails);

export default router;
