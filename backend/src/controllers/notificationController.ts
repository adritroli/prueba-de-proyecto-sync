import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const [notifications] = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};
