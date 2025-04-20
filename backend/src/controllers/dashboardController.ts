import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getDashboardStats = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    // Obtener estadísticas de tareas
    const [taskStats] = await connection.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN status_id != (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as pendingTasks,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgentTasks
      FROM tasks
    `) as RowDataPacket[][];

    // Obtener sprint activo
    const [activeSprint] = await connection.query<RowDataPacket[]>(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id AND status_id = (SELECT id FROM task_status WHERE name = 'done')) * 100.0 / 
        (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id) as progress
      FROM sprints s
      WHERE status = 'active'
      LIMIT 1
    `) as RowDataPacket[][];

    // Obtener resumen de proyectos
    const [projectSummary] = await connection.query(`
      SELECT 
        p.id,
        p.name,
        COUNT(t.id) as tasksCount,
        (COUNT(CASE WHEN t.status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 END) * 100.0 / COUNT(*)) as progress
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
    `);

    // Obtener actividad reciente con más detalles
    const [recentActivity] = await connection.query(`
      (SELECT 
        t.id,
        'task_created' as type,
        CONCAT('Nueva tarea: ', t.title) as description,
        t.created_at as date,
        u.name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee = u.id
      ORDER BY t.created_at DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        c.id,
        'comment_added' as type,
        CONCAT('Nuevo comentario en ', t.task_key) as description,
        c.created_at as date,
        u.name as user_name
      FROM task_comments c
      JOIN tasks t ON c.task_id = t.id
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        t.id,
        'task_completed' as type,
        CONCAT('Tarea completada: ', t.title) as description,
        t.updated_at as date,
        u.name as user_name
      FROM tasks t
      JOIN users u ON t.assignee = u.id
      WHERE t.status_id = (SELECT id FROM task_status WHERE name = 'done')
      ORDER BY t.updated_at DESC
      LIMIT 5)
      
      UNION ALL
      
      (SELECT 
        t.id,
        'task_urgent' as type,
        CONCAT('Nueva tarea urgente: ', t.title) as description,
        t.created_at as date,
        u.name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee = u.id
      WHERE t.priority = 'urgent'
      ORDER BY t.created_at DESC
      LIMIT 5)
      
      ORDER BY date DESC
      LIMIT 10
    `);

    res.json({
      ...taskStats[0],
      activeSprint: (activeSprint[0] as RowDataPacket) || null,
      projectSummary,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};
