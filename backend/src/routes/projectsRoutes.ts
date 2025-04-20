import { Router } from 'express';
import { 
  createProject, 
  getProjectTeams, 
  updateProjectTeams ,
  getProjects
} from '../controllers/projectsController';

const router = Router();

router.post('/projects', createProject);
router.get('/projects/:id/teams', getProjectTeams);
router.put('/projects/:id/teams', updateProjectTeams);
router.get('/projects', getProjects);

export default router;
