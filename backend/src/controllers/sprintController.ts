import { RequestHandler } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/db";








































    export const getCompletedSprints: RequestHandler = async (req, res) => {
        try {
            // Obtener sprints completados
            const [sprints] = await pool.query<RowDataPacket[]>(
                "SELECT * FROM sprints WHERE status = 'completed' ORDER BY end_date DESC"
            );

            // Obtener todas las tareas asociadas a los sprints completados
            const sprintIds = sprints.map(sprint => sprint.id);

            if (sprintIds.length === 0) {
                res.json({ sprints: [], tasks: [] });
                return;
            }

            const [tasks] = await pool.query<RowDataPacket[]>(
                `SELECT t.*, 
              u.username as assignee_name,
              s.name as status_name,
              s.color as status_color
       FROM tasks t
       LEFT JOIN users u ON t.assignee = u.id
       LEFT JOIN task_status s ON t.status_id = s.id
       WHERE t.sprint_id IN (?)`,
                [sprintIds]
            );

            res.json({
                sprints,
                tasks: tasks || []
            });
        } catch (error) {
            console.error("Error al obtener sprints completados:", error);
            res.status(500).json({
                message: "Error al obtener sprints completados"
            });
        }
    };
