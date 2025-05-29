import { Router } from 'express';
import { 
  getTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  getTeamMembers,  // Agregar esta importación
  updateTeamMembers // Agregar esta importación
} from '../controllers/teamsController';

const router = Router();

router.get('/team', getTeams);
router.post('/team', createTeam);
router.put('/team/:id', updateTeam);
router.delete('/team/:id', deleteTeam);

router.get('/team/:id/members', getTeamMembers);
router.put('/team/:id/members', updateTeamMembers);

export default router;
