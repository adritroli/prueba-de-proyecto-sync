import { Request, Response } from 'express';
import { pool } from '../config/db';

export const searchGlobal = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const [results] = await pool.query(`
      SELECT 'task' as type, id, title as name, description
      FROM tasks 
      WHERE title LIKE ? OR description LIKE ?
      UNION
      SELECT 'project' as type, id, name, description
      FROM projects
      WHERE name LIKE ? OR description LIKE ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error en la búsqueda' });
  }
};
