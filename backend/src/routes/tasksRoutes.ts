import { Router } from 'express';
import { RequestHandler } from 'express';
import { 
  getTasks, 
  createTask, 
  getSprints,
  createSprint,
  activateSprint,
  completeSprint,
  updateTaskStatus,
  updateTask,
  assignTasksToSprint,
  removeFromSprint,
  getTaskStatuses,
  getActiveSprint,
  getTaskByKey,
  getTaskComments,
  addTaskComment,
  getTaskSLA,
  updateTaskUser  
} from '../controllers/taskController';

const router = Router();

router.get('/task', getTasks);
router.post('/task', createTask);
router.get('/sprints', getSprints);
router.post('/sprints', createSprint);
router.put('/sprints/:id/activate', activateSprint);
router.put('/sprints/:id/complete', completeSprint);
router.put('/task/:id/status', updateTaskStatus);
router.put('/task/:id', updateTask);
router.put('/tasks/assign-to-sprint', assignTasksToSprint);
router.put('/tasks/:taskId/remove-from-sprint', removeFromSprint);
router.get('/task-status', getTaskStatuses);
router.get('/sprints/active', getActiveSprint);

router.get('/task/:taskKey', getTaskByKey as RequestHandler);
router.get('/task/:taskKey/comments', getTaskComments as RequestHandler);
router.post('/task/:taskKey/comments', addTaskComment as RequestHandler);
router.get('/task/:taskId/sla', getTaskSLA as RequestHandler);
router.put('/task/:taskKey/update-user', updateTaskUser);

export default router;
