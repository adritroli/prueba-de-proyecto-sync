import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface ProjectRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  status: string;
  team_id: number;
  manager_id: number;
  created_at: string;
  updated_at: string;
}

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    let { code, name, description, team_id, manager_id } = req.body;

    // Si no se proporciona un código, generarlo a partir del nombre
    if (!code) {
      code = name
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .toUpperCase();
    }

    // Validar que el código sea único
    const [existingCode] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM projects WHERE code = ?',
      [code]
    );

    if (existingCode.length > 0) {
      res.status(400).json({ 
        message: `El código ${code} ya existe`,
        error: 'DUPLICATE_CODE'
      });
      return;
    }

    await connection.beginTransaction();

    const [result]: any = await connection.query(
      'INSERT INTO projects (code, name, description, team_id, manager_id, status, created_at) VALUES (?, ?, ?, ?, ?, "active", NOW())',
      [code, name, description, parseInt(team_id), parseInt(manager_id)]
    );

    // Obtener el proyecto creado con toda su información
    const [newProject] = await connection.query<ProjectRow[]>(`
      SELECT 
        p.*,
        t.team_name,
        u.name as manager_name,
        COUNT(tk.id) as tasks_count,
        SUM(CASE WHEN tk.status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks tk ON p.id = tk.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [result.insertId]);

    await connection.commit();
    res.status(201).json(newProject[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Error al crear proyecto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

export const getProjectTeams = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [teams]: any = await pool.query(
      `SELECT t.* FROM teams t 
       JOIN project_teams pt ON t.id = pt.team_id 
       WHERE pt.project_id = ?`,
      [id]
    );
    res.json(teams);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateProjectTeams = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { teamIds } = req.body;

    await connection.beginTransaction();

    // Eliminar asignaciones existentes
    await connection.query('DELETE FROM project_teams WHERE project_id = ?', [id]);

    // Insertar nuevas asignaciones
    if (teamIds && teamIds.length > 0) {
      const values = teamIds.map((teamId: number) => [id, teamId]);
      await connection.query(
        'INSERT INTO project_teams (project_id, team_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.json({ message: 'Equipos actualizados exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

//******* Obtener proyectos
export const getProjects = async (req: Request, res: Response) => {
  try {
    // Obtener proyectos con conteo de tareas y tareas completadas
    const [projects] = await pool.query<ProjectRow[]>(`
      SELECT 
        p.*,
        t.team_name,
        u.name as manager_name,
        COUNT(tk.id) as tasks_count,
        SUM(CASE WHEN tk.status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks tk ON p.id = tk.project_id
      GROUP BY p.id, p.name, p.description, p.status, p.created_at, p.updated_at, 
               p.team_id, p.manager_id, t.team_name, u.name
      ORDER BY p.created_at DESC
    `);

    res.json({
      data: projects,
      pagination: {
        total: projects.length,
        page: 1,
        limit: projects.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
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

export const updateProject = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, description, team_id, manager_id, status } = req.body;

    await connection.beginTransaction();

    await connection.query(
      'UPDATE projects SET name = ?, description = ?, team_id = ?, manager_id = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [name, description, team_id, manager_id, status, id]
    );

    const [updatedProject] = await connection.query<ProjectRow[]>(`
      SELECT 
        p.*,
        t.team_name,
        u.name as manager_name,
        COUNT(tk.id) as tasks_count,
        SUM(CASE WHEN tk.status_id = (SELECT id FROM task_status WHERE name = 'done') THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN teams t ON p.team_id = t.id
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN tasks tk ON p.id = tk.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    await connection.commit();
    res.json(updatedProject.length > 0 ? updatedProject[0] : null);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error al actualizar proyecto' });
  } finally {
    connection.release();
  }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE projects SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Estado del proyecto actualizado' });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Error al actualizar estado del proyecto' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Actualizar tareas asociadas
    await connection.query(
      'UPDATE tasks SET project_id = NULL WHERE project_id = ?',
      [id]
    );

    // Eliminar proyecto
    await connection.query('DELETE FROM projects WHERE id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error al eliminar proyecto' });
  } finally {
    connection.release();
  }
};

// Agregar un endpoint para obtener equipos disponibles
export const getAvailableTeams = async (req: Request, res: Response) => {
  try {
    const [teams] = await pool.query('SELECT id, team_name FROM teams');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener equipos' });
  }
};