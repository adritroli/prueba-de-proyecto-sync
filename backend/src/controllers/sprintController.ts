import { RequestHandler, Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
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

export const createSprint = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    // Verificar sprint activo primero
    const [activeSprint] = await connection.query<RowDataPacket[]>(
      'SELECT id, name FROM sprints WHERE status = "active"'
    );

    if (activeSprint.length > 0) {
      res.status(400).json({
        message: `Ya existe un sprint activo: ${activeSprint[0].name}`,
        activeSprintId: activeSprint[0].id
      });
      return;
    }

    const { name, start_date, end_date, goal } = req.body;

    // Validaciones
    const validationErrors = [];
    if (!name) validationErrors.push('El nombre es requerido');
    if (!start_date) validationErrors.push('La fecha de inicio es requerida');
    if (!end_date) validationErrors.push('La fecha de fin es requerida');

    if (validationErrors.length > 0) {
      res.status(400).json({
        message: 'Errores de validación',
        errors: validationErrors
      });
      return;
    }

    // Validar nombre único
    const [existingSprint] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM sprints WHERE name = ?',
      [name]
    );

    if (existingSprint.length > 0) {
      res.status(400).json({ 
        message: 'Ya existe un sprint con ese nombre',
        type: 'name_duplicate'
      });
      return;
    }

    // Validación de fechas
    const formattedStartDate = new Date(start_date).toISOString().split('T')[0];
    const formattedEndDate = new Date(end_date).toISOString().split('T')[0];

    // Insertar sprint como "planned"
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO sprints (name, start_date, end_date, goal, status) VALUES (?, ?, ?, ?, "planned")',
      [name, formattedStartDate, formattedEndDate, goal || '']
    );

    const [newSprint] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM sprints WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newSprint[0]);
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({
      message: 'Error al crear sprint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    connection.release();
  }
};

// Agregar endpoint para verificar sprint activo
export const getActiveSprint = async (req: Request, res: Response) => {
  try {
    const [sprint] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, status FROM sprints WHERE status = "active"'
    );

    res.json({ sprint: sprint[0] || null });
  } catch (error) {
    console.error('Error checking active sprint:', error);
    res.status(500).json({ message: 'Error al verificar sprint activo' });
  }
};
