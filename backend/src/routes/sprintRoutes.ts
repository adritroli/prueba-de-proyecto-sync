import { Router } from 'express';
import { getCompletedSprints, createSprint, getActiveSprint } from '../controllers/sprintController';

const router = Router();


router.get("/sprints/completed", getCompletedSprints);// Ruta para obtener sprints completadosconst router = express.Router();import { getCompletedSprints } from "../controllers/sprintController";
router.post("/sprints", createSprint);// Ruta para crear un nuevo sprint
router.get("/sprints/active", getActiveSprint);// Ruta para obtener el sprint activo

export default router;


