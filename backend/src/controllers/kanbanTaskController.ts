import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const createKanbanTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      description,
      board_id,
      priority,
      assigned_to,
      due_date,
      tags
    } = req.body;

    // Primero obtenemos la columna inicial (position 0) del tablero seleccionado
    const [columns] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM board_columns WHERE board_id = ? AND position = 0',
      [board_id]
    );

    if (!columns || columns.length === 0) {
       res.status(400).json({ 
        message: 'No se encontró la columna inicial para este tablero' 
      });
    }

    const column_id = columns[0].id;

    // Insertar la tarea con la columna inicial
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO kanban_tasks (
        title, description, board_id, column_id,
        priority, assigned_to, due_date, tags,
        position, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [
        title,
        description,
        board_id,
        column_id,
        priority,
        assigned_to || null,
        due_date || null,
        tags ? JSON.stringify(tags) : null
      ]
    );

    // Obtener la tarea creada con información adicional
    const [newTask] = await pool.query<RowDataPacket[]>(
      `SELECT t.*, 
        u.name as creator_name,
        b.name as board_name,
        c.title as column_name
       FROM kanban_tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN kanban_boards b ON t.board_id = b.id
       LEFT JOIN board_columns c ON t.column_id = c.id
       WHERE t.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getBoardTasks = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;

    const [tasks] = await pool.query(
      `SELECT * FROM kanban_tasks 
       WHERE board_id = ?
       ORDER BY column_id, position`,
      [boardId]
    );

    res.json(tasks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { position, column_id } = req.body;

    await pool.query(
      'UPDATE kanban_tasks SET position = ?, column_id = ? WHERE id = ?',
      [position, column_id, taskId]
    );

    res.status(200).json({ message: 'Task moved successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getTasksByBoard = async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    
    // Obtiene las tareas con info relacionada
    const [tasks] = await pool.query(`
      SELECT 
        kt.*,
        u.name as assignee_name,
        u.avatar as assignee_avatar,
        bc.title as column_title
      FROM kanban_tasks kt
      LEFT JOIN users u ON kt.assigned_to = u.id
      LEFT JOIN board_columns bc ON kt.column_id = bc.id
      WHERE kt.board_id = ?
      ORDER BY kt.position
    `, [boardId]);

    res.json(tasks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
