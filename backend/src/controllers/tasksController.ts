import { Request, Response } from "express";
import { pool } from "../config/db";
import { createNotification } from "./notificationsController";

// Envuelve las llamadas await en una función async
export async function sendTaskNotifications(assigneeId: string, taskTitle: string, newStatus: string) {
	// Cuando se asigna una tarea:
	await createNotification(Number(assigneeId), "task_assigned", `Tarea asignada "${taskTitle}"`);

	// Cuando cambia el estado:
	await createNotification(Number(assigneeId), "task_status", `La tarea "${taskTitle}" cambió de estado a "${newStatus}"`);

	// Cuando se agrega un comentario:
	await createNotification(Number(assigneeId), "task_comment", `Nuevo comentario en la tarea "${taskTitle}"`);
}

// Llama a la función con los argumentos necesarios
// sendTaskNotifications(assigneeId, taskTitle, newStatus);

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id de la tarea
    const { status_id } = req.body;

    // Actualiza el estado de la tarea
    await pool.query(
      "UPDATE tasks SET status_id = ? WHERE id = ?",
      [status_id, id]
    );

    // Obtiene los datos de la tarea y el usuario asignado
    const [rows] = await pool.query(
      `SELECT t.title, t.assignee, ts.name as status_name
       FROM tasks t
       LEFT JOIN task_status ts ON t.status_id = ts.id
       WHERE t.id = ?`,
      [id]
    ) as [{ title: string; assignee: number; status_name: string }[], unknown];

    if (rows.length > 0 && rows[0].assignee) {
      const assigneeId = rows[0].assignee;
      const taskTitle = rows[0].title;
      const newStatus = rows[0].status_name;

      console.log(`[TASK] Enviando notificación de cambio de estado: tarea=${taskTitle}, assigneeId=${assigneeId}, newStatus=${newStatus}`);

      // Crea la notificación solo si hay asignado
      await createNotification(
        assigneeId,
        "task_status",
        `La tarea "${taskTitle}" cambió de estado a "${newStatus}"`
      );
    }

    res.json({ success: true, message: "Estado actualizado y notificación enviada si corresponde." });
  } catch (error) {
    console.error("Error en updateTaskStatus:", error);
    res.status(500).json({ message: "Error al actualizar el estado de la tarea" });
  }
};