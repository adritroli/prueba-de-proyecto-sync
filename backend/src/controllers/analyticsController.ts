import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getProjectMetrics = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    const [metrics] = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status_id = 5 THEN 1 ELSE 0 END) as completed_tasks,
        AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_completion_time
      FROM tasks 
      WHERE project_id = ?
    `, [projectId]);
    res.json(metrics[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métricas' });
  }
};
