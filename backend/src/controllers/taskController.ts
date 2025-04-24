import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  priority: string;
  status_id: number;
  status_name: string;
  status_color: string;
  // ...otros campos de task
}

export const getTasks = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<TaskRow[]>(`
      SELECT 
        t.*,
        u.name as assignee_name,
        u.avatar as assignee_avatar,
        ts.name as status_name,
        ts.color as status_color,
        s.name as sprint_name,
        p.name as project_name,
        p.badge_color as project_badge_color
      FROM tasks t
      LEFT JOIN users u ON t.assignee = u.id
      LEFT JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN sprints s ON t.sprint_id = s.id
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      data: rows,
      pagination: {
        total: rows.length,
        page: 1,
        limit: rows.length,
        totalPages: 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      data: [], 
      pagination: {
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0
      }
    });
  }
};

export const getSprints = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM sprints
      ORDER BY start_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener sprints' });
  }
};

export const createSprint = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { name, start_date, end_date, goal } = req.body;

    // Convertir las fechas ISO a formato MySQL DATE
    const formattedStartDate = new Date(start_date).toISOString().split('T')[0];
    const formattedEndDate = new Date(end_date).toISOString().split('T')[0];

    // Verificar si hay un sprint activo
    const [activeSprint] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM sprints WHERE status = "active"'
    );

    if (activeSprint.length > 0) {
      res.status(400).json({ message: 'Ya existe un sprint activo' });
      return;
    }

    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO sprints (name, start_date, end_date, goal, status) VALUES (?, ?, ?, ?, "planned")',
      [name, formattedStartDate, formattedEndDate, goal]
    );

    const [newSprint] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM sprints WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newSprint[0]);
  } catch (error) {
    console.error('Error creating sprint:', error);
    res.status(500).json({ message: 'Error al crear sprint' });
  } finally {
    connection.release();
  }
};

export const activateSprint = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE sprints SET status = "active" WHERE id = ?', [id]);
    res.json({ message: 'Sprint activado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al activar sprint' });
  }
};

export const completeSprint = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE sprints SET status = "completed" WHERE id = ?', [id]);
    res.json({ message: 'Sprint completado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al completar sprint' });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status_id } = req.body;

    // Obtener el status actual y nuevo
    const [currentStatus] = await connection.query<RowDataPacket[]>(
      "SELECT ts.name FROM tasks t JOIN task_status ts ON t.status_id = ts.id WHERE t.id = ?",
      [id]
    );
    
    const [newStatus] = await connection.query<RowDataPacket[]>(
      "SELECT name FROM task_status WHERE id = ?",
      [status_id]
    );

    // Gestionar SLA
    if (newStatus[0].name === 'in_progress') {
      // Obtener o crear registro SLA
      const [currentSLA] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM task_sla_history 
         WHERE task_id = ? 
         ORDER BY id DESC LIMIT 1`,
        [id]
      );

      if (!currentSLA[0] || !currentSLA[0].is_active) {
        // Crear nuevo registro SLA
        const accumulatedTime = currentSLA[0]?.accumulated_time || 0;
        await connection.query(
          `INSERT INTO task_sla_history 
           (task_id, start_time, accumulated_time, is_active) 
           VALUES (?, NOW(), ?, true)`,
          [id, accumulatedTime]
        );
      }
    } else if (currentStatus[0].name === 'in_progress') {
      // Finalizar SLA activo
      await connection.query(
        `UPDATE task_sla_history 
         SET end_time = NOW(),
             accumulated_time = accumulated_time + TIMESTAMPDIFF(MINUTE, start_time, NOW()),
             is_active = false
         WHERE task_id = ? AND is_active = true`,
        [id]
      );
    }

    // Actualizar estado de la tarea
    await connection.query(
      "UPDATE tasks SET status_id = ? WHERE id = ?",
      [status_id, id]
    );

    await connection.commit();
    res.json({ message: "Task status updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Error updating task status" });
  } finally {
    connection.release();
  }
};

export const getTaskSLA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    // Primero obtener el ID real de la tarea
    const [taskData] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM tasks WHERE task_key = ?',
      [taskId]
    );

    if (!taskData[0]) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    const realTaskId = taskData[0].id;
    
    const [slaData] = await pool.query<RowDataPacket[]>(
      `SELECT 
        h.*,
        CASE 
          WHEN h.is_active AND ts.name = 'in_progress'
          THEN h.accumulated_time + TIMESTAMPDIFF(MINUTE, h.start_time, NOW())
          ELSE h.accumulated_time
        END as total_time,
        CASE
          WHEN h.is_active AND ts.name = 'in_progress' THEN 'active'
          ELSE 'inactive'
        END as status
       FROM task_sla_history h
       JOIN tasks t ON h.task_id = t.id
       JOIN task_status ts ON t.status_id = ts.id
       WHERE t.id = ?
       ORDER BY h.id DESC
       LIMIT 1`,
      [realTaskId]
    );

    if (!slaData[0]) {
      // Si no existe registro SLA, crear uno nuevo
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO task_sla_history (task_id, start_time, accumulated_time, is_active)
         VALUES (?, NOW(), 0, false)`,
        [realTaskId]
      );

      res.json({
        id: result.insertId,
        start_time: null,
        end_time: null,
        accumulated_time: 0,
        total_time: 0,
        status: 'inactive'
      });
      return;
    }

    res.json(slaData[0]);
  } catch (error) {
    console.error("Error fetching task SLA:", error);
    res.status(500).json({ message: "Error fetching task SLA" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { title, description, priority, story_points, assignee, tags, project_id } = req.body;
    const created_by = req.body.userId; // Obtenemos el ID del usuario que crea la tarea

    await connection.beginTransaction();

    // Obtener el siguiente número de tarea para el proyecto
    const [lastTask] = await connection.query<RowDataPacket[]>(
      'SELECT COALESCE(MAX(task_number), 0) as last_number FROM tasks WHERE project_id = ?',
      [project_id]
    );
    const nextNumber = lastTask[0].last_number + 1;

    // Obtener el código del proyecto
    const [projectResult] = await connection.query<RowDataPacket[]>(
      'SELECT code FROM projects WHERE id = ?',
      [project_id]
    );

    if (!projectResult.length) {
      res.status(400).json({ message: 'Proyecto no encontrado' });
      return;
    }

    const projectCode = projectResult[0].code;
    const taskKey = `${projectCode}-${String(nextNumber).padStart(3, '0')}`;

    // Crear la tarea
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tasks (
        task_number, project_code, task_key,
        title, description, priority, 
        story_points, assignee, tags, 
        status_id, project_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nextNumber,
        projectCode,
        taskKey,
        title,
        description,
        priority,
        story_points,
        assignee,
        JSON.stringify(tags),
        ((await connection.query<RowDataPacket[]>('SELECT id FROM task_status WHERE name = "backlog" LIMIT 1'))[0] as RowDataPacket[])[0].id,
        project_id,
        created_by
      ]
    );

    // Obtener la tarea creada con toda su información
    const [newTask] = await connection.query<TaskRow[]>(`
      SELECT t.*, 
             ts.name as status_name, 
             ts.color as status_color,
             u.name as assignee_name,
             u2.name as creator_name,
             p.code as project_code
      FROM tasks t
      LEFT JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN users u ON t.assignee = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ?
    `, [result.insertId]);

    await connection.commit();
    res.status(201).json(newTask[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error al crear tarea' });
  } finally {
    connection.release();
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { title, description, priority, story_points, assignee, sprint_id, tags } = req.body;
    
    // Convertir "_none" a NULL para la base de datos
    const assigneeValue = assignee === "_none" ? null : assignee;
    const sprintValue = sprint_id === "_none" ? null : sprint_id;

    await pool.query(
      `UPDATE tasks 
       SET title = ?, description = ?, priority = ?, 
           story_points = ?, assignee = ?, sprint_id = ?, 
           tags = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, priority, story_points, assigneeValue, sprintValue, JSON.stringify(tags), id]
    );
    res.json({ message: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tarea' });
  }
};

export const assignTasksToSprint = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { taskIds, sprintId } = req.body;

    // Verificar que el sprint exista y esté activo
    const [sprint] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM sprints WHERE id = ? AND status = "active"',
      [sprintId]
    );

    if (!sprint.length) {
      res.status(400).json({ message: 'Sprint no encontrado o no está activo' });
      return;
    }

    await connection.beginTransaction();

    // Actualizar todas las tareas seleccionadas
    await connection.query(
      'UPDATE tasks SET sprint_id = ?, updated_at = NOW() WHERE id IN (?)',
      [sprintId, taskIds]
    );

    await connection.commit();
    res.json({ message: 'Tareas asignadas al sprint exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error assigning tasks:', error);
    res.status(500).json({ message: 'Error al asignar tareas' });
  } finally {
    connection.release();
  }
};

export const removeFromSprint = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  try {
    await pool.query(
      'UPDATE tasks SET sprint_id = NULL WHERE id = ?',
      [taskId]
    );
    res.json({ message: 'Tarea removida del sprint exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al remover tarea del sprint' });
  }
};

export const getTaskStatuses = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM task_status ORDER BY order_index');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching task statuses:', error);
    res.status(500).json({ message: 'Error al obtener estados de tareas' });
  }
};

export const getActiveSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const [sprints] = await pool.query<any[]>(
      'SELECT * FROM sprints WHERE status = "active" LIMIT 1'
    );

    if (!sprints.length) {
      res.json({ sprint: null, tasks: [] });
      return; // Agregar return para evitar múltiples respuestas
    }

    const sprint = sprints[0];

    const [tasks] = await pool.query<any[]>(`
      SELECT t.*, 
             u.name as assignee_name, 
             u.avatar as assignee_avatar,
             ts.name as status_name,
             ts.color as status_color
      FROM tasks t
      LEFT JOIN users u ON t.assignee = u.id
      LEFT JOIN task_status ts ON t.status_id = ts.id
      WHERE t.sprint_id = ?
    `, [sprint.id]);

    res.json({ sprint, tasks });
  } catch (error) {
    console.error('Error getting active sprint:', error);
    res.status(500).json({ message: 'Error al obtener sprint activo' });
  }
};

export const getTaskByKey = async (req: Request, res: Response) => {
  try {
    const { taskKey } = req.params;
    const [tasks] = await pool.query<TaskRow[]>(`
      SELECT t.*, 
             ts.name as status_name,
             ts.color as status_color,
             u.name as assignee_name,
             u.last_name as assignee_last_name,
             u.avatar as assignee_avatar,
             c.name as creator_name,
             c.last_name as creator_last_name,
             c.avatar as creator_avatar,
             p.code as project_code
      FROM tasks t
      LEFT JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN users u ON t.assignee = u.id
      LEFT JOIN users c ON t.created_by = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.task_key = ?
    `, [taskKey]);

    if (!tasks.length) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    res.json(tasks[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Error al obtener tarea' });
  }
};

export const getTaskComments = async (req: Request, res: Response) => {
  try {
    const { taskKey } = req.params;
    const [comments] = await pool.query(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM task_comments c
      JOIN users u ON c.user_id = u.id
      JOIN tasks t ON c.task_id = t.id
      WHERE t.task_key = ?
      ORDER BY c.created_at DESC
    `, [taskKey]);
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error al obtener comentarios' });
  }
};

export const addTaskComment = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { taskKey } = req.params;
    const { comment } = req.body;
    const userId = 1; // TODO: Obtener del token de autenticación

    await connection.beginTransaction();

    // Obtener el ID de la tarea
    const [tasks] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM tasks WHERE task_key = ?',
      [taskKey]
    );

    if (!tasks.length) {
      res.status(404).json({ message: 'Tarea no encontrada' });
      return;
    }

    const taskId = tasks[0].id;

    // Insertar el comentario
    await connection.query(
      'INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [taskId, userId, comment]
    );

    await connection.commit();
    res.status(201).json({ message: 'Comentario agregado' });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error al agregar comentario' });
  } finally {
    connection.release();
  }
};

export const updateTaskUser = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { taskKey } = req.params;
    const { field, userId } = req.body;

    await connection.beginTransaction();

    const updateField = field === 'assignee' ? 'assignee' : 'created_by';
    
    await connection.query(
      `UPDATE tasks SET ${updateField} = ? WHERE task_key = ?`,
      [userId, taskKey]
    );

    const [updatedTask] = await connection.query<RowDataPacket[]>(`
      SELECT t.*, 
             ts.name as status_name,
             ts.color as status_color,
             u.name as assignee_name,
             u.avatar as assignee_avatar,
             c.name as creator_name,
             c.avatar as creator_avatar
      FROM tasks t
      LEFT JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN users u ON t.assignee = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE t.task_key = ?
    `, [taskKey]);

    await connection.commit();
    res.json(updatedTask[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating task user:', error);
    res.status(500).json({ message: 'Error al actualizar usuario de la tarea' });
  } finally {
    connection.release();
  }
};
