import express from "express";
import {
  getTasks,
  getTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskAssignedUser,
  getUsers,
  getPendingTasks,
  getSprintTasks,
  getTaskStatuses,
  newTask,
  getComments,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  getTaskSLA,
} from "../controllers/tasksController";
import timeEntriesRoutes from "./timeEntriesRoutes";

const router = express.Router();

router.get('/pending', getPendingTasks);
router.get('/sprint', getSprintTasks);
router.get("/tasks", getTasks);
router.get("/tasks/:id", getTasks);
router.get("/task/:id", getTask);
router.get("/task-statuses", getTaskStatuses);
router.get("/users", getUsers);
router.get("/task/:id/comments", getComments);
router.get("/task/:id/sla", getTaskSLA);

router.put("/tasks/:id/status", updateTaskStatus); // ✅ Ahora esta ruta existe
router.put("/tasks/:id/priority", updateTaskPriority);
router.put("/tasks/:id/assign", updateTaskAssignedUser);
router.post("/tasks-newtask", newTask);
router.post("/task/:id/comments", addTaskComment);
router.put("/comments/:id", updateTaskComment);
router.delete("/comments/:id", deleteTaskComment);

router.use('/time-entries', timeEntriesRoutes); // Agregar esta línea

export default router;