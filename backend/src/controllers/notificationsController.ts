import { Request, Response } from "express";
import { pool } from "../config/db";

// Obtener notificaciones de un usuario
export const getUserNotifications = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [userId]
  );
  res.json(rows);
};

// Marcar notificación como leída
export const markNotificationRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
  res.json({ success: true });
};

// Crear notificación
export const createNotification = async (userId: number, type: string, message: string) => {
  try {
    console.log(`[NOTIF] Intentando crear notificación para userId=${userId}, type=${type}, message=${message}`);
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
      [userId, type, message]
    );
    console.log(`[NOTIF] Notificación creada para userId=${userId} (insertId: ${(result as any).insertId})`);
  } catch (error) {
    console.error("[NOTIF] Error al crear notificación:", error);
  }
};
