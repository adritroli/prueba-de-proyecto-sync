import { Router } from 'express';
import { 
  getProjects, 
  createProject, 
  updateProject,
  updateProjectStatus,
  deleteProject 
} from '../controllers/projectsController';

const router = Router();

router.get('/projects', getProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.put('/projects/:id/status', updateProjectStatus);
router.delete('/projects/:id', deleteProject);

export default router;
