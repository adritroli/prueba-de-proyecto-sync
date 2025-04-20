import express from 'express';
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { createKanbanTask, getTasksByBoard } from '../controllers/kanbanTaskController';
import { Router } from 'express';
import { getBoards, enviarID } from '../controllers/kanbanBoardController';

const router = Router();



// Rutas para tareas de kanban
router.post('/kanban-tasks', createKanbanTask);
router.get('/kanban-tasks/board/:boardId', getTasksByBoard);
router.get("/kanban-boards/:boardId", enviarID);

// Agregar nueva ruta para obtener todas las tareas
router.get('/kanban-tasks', async (req: Request, res: Response) => {
  try {
    const [tasks] = await pool.query<RowDataPacket[]>(`
      SELECT 
        kt.*,
        kb.name as board_name,
        bc.title as column_title,
        u.name as assigned_name,
        COALESCE(
          (SELECT COUNT(*) 
           FROM task_comments tc 
           WHERE tc.task_id = kt.id), 
          0
        ) as comments_count
      FROM kanban_tasks kt
      LEFT JOIN kanban_boards kb ON kt.board_id = kb.id
      LEFT JOIN board_columns bc ON kt.column_id = bc.id
      LEFT JOIN users u ON kt.assigned_to = u.id
      ORDER BY kt.created_at DESC
    `);
    
    res.json(tasks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Rutas para tableros Kanban
router.get('/kanban-boards', getBoards);

export default router;
