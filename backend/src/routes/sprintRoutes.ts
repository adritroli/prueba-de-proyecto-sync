import { Router } from 'express';
import { getCompletedSprints } from '../controllers/sprintController';

const router = Router();


router.get("/sprints/completed", getCompletedSprints);// Ruta para obtener sprints completadosconst router = express.Router();import { getCompletedSprints } from "../controllers/sprintController";


// ...existing code...




export default router;


