import express from 'express';
import { getLinkedTasks, linkTask, searchTasks } from '../controllers/linkedTasksController';

const router = express.Router();

router.get('/task/:taskKey/linked', getLinkedTasks);
router.post('/task/:taskKey/link', linkTask);
router.get('/tasks/search', searchTasks);

export default router;
