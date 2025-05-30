import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { RowDataPacket } from 'mysql2';

interface DashboardConfigRow extends RowDataPacket {
  user_id: number;
  config: string;
  updated_at: Date;
}

const DEFAULT_CONFIG = {
  layout: 'grid',
  widgets: [
    { id: '1', type: 'activeSprint', position: 0, visible: true },
    { id: '2', type: 'projectSummary', position: 1, visible: true },
    { id: '3', type: 'tasksByStatus', position: 2, visible: true },
    { id: '4', type: 'teamPerformance', position: 3, visible: true }
  ]
};

export const getDashboardConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Verificar si existe la tabla
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'dashboard_configs'"
    );

    if (Array.isArray(tables) && tables.length === 0) {
      // Crear la tabla si no existe
      await connection.query(`
        CREATE TABLE IF NOT EXISTS dashboard_configs (
          user_id INT PRIMARY KEY,
          config JSON NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
    }

    const [rows] = await connection.query<DashboardConfigRow[]>(
      'SELECT config FROM dashboard_configs WHERE user_id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      // Crear configuración por defecto para el usuario
      const defaultConfig = {
        userId,
        ...DEFAULT_CONFIG
      };

      await connection.query(
        'INSERT INTO dashboard_configs (user_id, config) VALUES (?, ?)',
        [userId, JSON.stringify(defaultConfig)]
      );

      res.json(defaultConfig);
      return;
    }

    // Verificar si config es string o objeto
    const configData = typeof rows[0].config === 'string' 
      ? JSON.parse(rows[0].config)
      : rows[0].config;

    res.json(configData);
  } catch (error) {
    console.error('Error en getDashboardConfig:', error);
    res.status(500).json({
      message: 'Error al obtener configuración',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

export const saveDashboardConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const config = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    await connection.query(
      'INSERT INTO dashboard_configs (user_id, config) VALUES (?, ?) ON DUPLICATE KEY UPDATE config = ?',
      [userId, JSON.stringify(config), JSON.stringify(config)]
    );

    res.json({ message: 'Configuración guardada exitosamente' });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).json({ 
      message: 'Error al guardar configuración',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};
