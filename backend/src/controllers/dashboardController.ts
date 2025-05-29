import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getDashboardStats = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    // Estadísticas globales de tareas
    const [taskStats] = await connection.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN status_id != (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as pendingTasks,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgentTasks,
        AVG(story_points) as avgStoryPoints,
        SUM(story_points) as totalStoryPoints,
        COUNT(DISTINCT assignee) as activeAssignees,
        -- Agregar estadísticas adicionales
        SUM(CASE WHEN sprint_id IS NOT NULL THEN 1 ELSE 0 END) as tasksInSprints,
        SUM(CASE WHEN sprint_id IS NULL THEN 1 ELSE 0 END) as tasksBacklog,
        SUM(CASE 
          WHEN status_id = (SELECT id FROM task_status WHERE name = 'in_progress') THEN 1 
          ELSE 0 
        END) as inProgressTasks
      FROM tasks
    `);

    // Estadísticas por sprint
    const [sprintStats] = await connection.query<RowDataPacket[]>(`
      SELECT 
        COUNT(DISTINCT s.id) as totalSprints,
        SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) as completedSprints,
        SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as activeSprints
      FROM sprints s
    `);

    // Estadísticas de usuario
    const [userStats] = await connection.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN connection_status = 'online' THEN 1 ELSE 0 END) as onlineUsers,
        COUNT(DISTINCT team_id) as activeTeams
      FROM users
    `);

    // Estadísticas de equipo
    const [teamPerformance] = await connection.query(`
      SELECT 
        t.team_name,
        COUNT(tk.id) as total_tasks,
        SUM(CASE WHEN tk.status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as completed_tasks,
        AVG(TIMESTAMPDIFF(HOUR, tk.created_at, tk.updated_at)) as avg_completion_time
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id
      LEFT JOIN tasks tk ON u.id = tk.assignee
      GROUP BY t.id
      ORDER BY completed_tasks DESC
      LIMIT 5
    `);

    // Top usuarios más productivos
    const [topPerformers] = await connection.query(`
      SELECT 
        u.name,
        u.avatar,
        COUNT(t.id) as tasks_completed,
        AVG(TIMESTAMPDIFF(HOUR, t.created_at, t.updated_at)) as avg_completion_time
      FROM users u
      JOIN tasks t ON u.id = t.assignee
      WHERE t.status_id = (SELECT id FROM task_status WHERE name = 'done')
      AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id
      ORDER BY tasks_completed DESC
      LIMIT 5
    `);

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

    // Estadísticas globales de tareas por estado
    const [tasksByStatus] = await connection.query(`
      SELECT 
        ts.name as status,
        ts.color,
        COUNT(t.id) as count,
        SUM(t.story_points) as total_points
      FROM task_status ts
      LEFT JOIN tasks t ON ts.id = t.status_id
      GROUP BY ts.id
      ORDER BY ts.order_index
    `);

    // Detalles del sprint activo con sus tareas
    const [activeSprintDetails] = await connection.query<RowDataPacket[]>(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id) as total_tasks,
        (SELECT SUM(story_points) FROM tasks WHERE sprint_id = s.id) as total_story_points,
        (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id AND status_id = (SELECT id FROM task_status WHERE name = 'done')) as completed_tasks,
        DATEDIFF(s.end_date, CURRENT_DATE()) as days_remaining
      FROM sprints s
      WHERE s.status = 'active'
      LIMIT 1
    `);

    const [activeSprintTasks] = await connection.query(`
      SELECT 
        t.*,
        ts.name as status_name,
        ts.color as status_color,
        u.name as assignee_name,
        u.avatar as assignee_avatar
      FROM tasks t
      JOIN task_status ts ON t.status_id = ts.id
      LEFT JOIN users u ON t.assignee = u.id
      WHERE t.sprint_id = ?
      ORDER BY t.priority DESC, t.created_at ASC
    `, [activeSprintDetails[0]?.id]);

    res.json({
      ...taskStats[0],
      sprintStats: sprintStats[0],
      userStats: userStats[0],
      teamPerformance,
      topPerformers,
      activeSprint: activeSprint[0] || null,
      projectSummary,
      recentActivity,
      tasksByStatus,
      activeSprintDetails: activeSprintDetails[0] || null,
      activeSprintTasks
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};
