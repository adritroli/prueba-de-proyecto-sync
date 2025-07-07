import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface TaskStats extends RowDataPacket {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  urgentTasks: number;
  inProgressTasks: number;
}

interface MonthlyStats extends RowDataPacket {
  month: string;
  completadas: number;
  pendientes: number;
  urgentes: number;
}

interface StatusStats extends RowDataPacket {
  status: string;
  count: number;
  total_points: number;
}

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    console.log('Iniciando consulta de estadísticas...');

    // Obtener estadísticas mensuales
    const [monthlyStats] = await connection.query<MonthlyStats[]>(`
      SELECT 
        DATE_FORMAT(t.created_at, '%b') as month,
        SUM(CASE WHEN ts.name = 'completed' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN ts.name = 'pending' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) as urgentes
      FROM tasks t
      JOIN tasks_status ts ON t.status_id = ts.id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
      ORDER BY t.created_at DESC
      LIMIT 6
    `);
    console.log('Resultados mensuales:', monthlyStats);

    // Obtener estadísticas generales
    const [generalStats] = await connection.query<TaskStats[]>(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN ts.name = 'completed' THEN 1 ELSE 0 END) as completedTasks,
        SUM(CASE WHEN ts.name = 'pending' THEN 1 ELSE 0 END) as pendingTasks,
        SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) as urgentTasks,
        SUM(CASE WHEN ts.name = 'in_progress' THEN 1 ELSE 0 END) as inProgressTasks
      FROM tasks t
      JOIN tasks_status ts ON t.status_id = ts.id
    `);
    console.log('Resultados generales:', generalStats[0]);

    // Obtener estadísticas por estado
    const [tasksByStatus] = await connection.query<StatusStats[]>(`
      SELECT 
        ts.name as status,
        COUNT(*) as count,
        SUM(t.story_points) as total_points
      FROM tasks t
      JOIN tasks_status ts ON t.status_id = ts.id
      GROUP BY ts.id, ts.name
    `);
    console.log('Resultados por estado:', tasksByStatus);

    // Combinar todas las estadísticas
    const stats = {
      ...(generalStats[0] as TaskStats),
      monthlyStats,
      tasksByStatus: tasksByStatus.map((status) => ({
        ...status,
        color: getStatusColor(status.status)
      }))
    };

    console.log('Estadísticas finales a enviar:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error detallado en getDashboardStats:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      error
    });
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  } finally {
    connection.release();
  }
};

function getStatusColor(status: string): string {
  const colors = {
    pending: '#eab308',
    in_progress: '#3b82f6',
    completed: '#22c55e',
    cancelled: '#ef4444'
  };
  return colors[status as keyof typeof colors] || '#71717a';
}
