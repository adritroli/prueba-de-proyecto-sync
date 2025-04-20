import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface LinkedTask extends RowDataPacket {
  task_key: string;
  title: string;
  status_name: string;
}

export const getLinkedTasks = async (req: Request, res: Response) => {
  try {
    const { taskKey } = req.params;
    const [rows] = await pool.execute<LinkedTask[]>(`
      SELECT t.task_key, t.title, s.name, p.badge_color
      FROM tasks t
      INNER JOIN linked_tasks lt ON t.task_key = lt.linked_task_key
      INNER JOIN task_status s ON t.status_id = s.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE lt.task_key = ?
    `, [taskKey]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching linked tasks:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const linkTask = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { taskKey } = req.params;
    const { targetTaskKey } = req.body;

    await connection.beginTransaction();

    // Verificar que las tareas existan
    const [checkResult] = await connection.execute<LinkedTask[]>(`
      SELECT task_key FROM tasks 
      WHERE task_key IN (?, ?)
    `, [taskKey, targetTaskKey]);
    
    if (checkResult.length !== 2) {
      throw new Error('Una o ambas tareas no existen');
    }

    // Crear el enlace usando INSERT IGNORE para MySQL
    await connection.execute<ResultSetHeader>(`
      INSERT IGNORE INTO linked_tasks (task_key, linked_task_key, created_at)
      VALUES (?, ?, NOW())
    `, [taskKey, targetTaskKey]);

    await connection.commit();
    res.json({ message: 'Tareas enlazadas correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error linking tasks:', error);
    res.status(500).json({ error: 'Error al enlazar las tareas' });
  } finally {
    connection.release();
  }
};

export const searchTasks = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    // Dividir la búsqueda en palabras para búsqueda más flexible
    const searchTerms = (q as string).split(' ').map(term => `%${term}%`);
    
    const [rows] = await pool.execute<LinkedTask[]>(`
      SELECT DISTINCT
        t.task_key,
        t.title,
        ts.name as status_name,
        p.code as project_code
      FROM tasks t
      LEFT JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 
        CONCAT(t.task_key, ' ', t.title, ' ', COALESCE(p.code, '')) LIKE ?
      ORDER BY 
        CASE 
          WHEN t.task_key = ? THEN 1
          WHEN t.task_key LIKE ? THEN 2
          WHEN t.title LIKE ? THEN 3
          ELSE 4
        END
      LIMIT 10
    `, [`%${q}%`, q, `${q}%`, `%${q}%`]);

    res.json(rows);
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const unlinkTask = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const { taskKey, linkedTaskKey } = req.params;
  
      await connection.beginTransaction();
  
      await connection.execute<ResultSetHeader>(`
        DELETE FROM linked_tasks 
        WHERE task_key = ? AND linked_task_key = ?
      `, [taskKey, linkedTaskKey]);
  
      await connection.commit();
      res.json({ message: 'Tarea desenlazada correctamente' });
    } catch (error) {
      await connection.rollback();
      console.error('Error unlinking task:', error);
      res.status(500).json({ error: 'Error al desenlazar la tarea' });
    } finally {
      connection.release();
    }
  };