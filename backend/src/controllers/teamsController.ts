import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getTeams = async (req: Request, res: Response) => {
  try {
    const [teams] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.*,
        COUNT(DISTINCT u.id) as members_count,
        CONCAT('[', 
          GROUP_CONCAT(
            CASE 
              WHEN u.id IS NOT NULL 
              THEN JSON_OBJECT(
                'id', u.id,
                'name', CONCAT(u.name, ' ', COALESCE(u.last_name, '')),
                'avatar', COALESCE(u.avatar, 'default-avatar.png')
              )
              ELSE NULL 
            END
          ),
        ']') as members_data
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id
      WHERE t.status = 'active'
      GROUP BY t.id
    `);

    const processedTeams = teams.map(team => ({
      ...team,
      members: team.members_data && team.members_data !== '[null]' 
        ? JSON.parse(team.members_data.replace(/\\/g, '')) 
        : [],
      members_count: parseInt(team.members_count || 0)
    }));

    res.json(processedTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error al obtener equipos', teams: [] });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { team_name, description } = req.body;

    await connection.beginTransaction();

    const [result]: any = await connection.query(
      'INSERT INTO teams (team_name, description, created_at) VALUES (?, ?, NOW())',
      [team_name, description]
    );

    const [newTeam] = await connection.query<RowDataPacket[]>(`
      SELECT t.*,
             COUNT(DISTINCT u.id) as members_count
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [result.insertId]);

    await connection.commit();
    res.status(201).json(newTeam[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Error al crear equipo' });
  } finally {
    connection.release();
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { team_name, description, status } = req.body;

    await connection.beginTransaction();

    await connection.query(
      'UPDATE teams SET team_name = ?, description = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [team_name, description, status, id]
    );

    const [updatedTeam] = await connection.query<RowDataPacket[]>(`
      SELECT t.*,
             COUNT(DISTINCT u.id) as members_count
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [id]);

    await connection.commit();
    res.json(updatedTeam[0] as RowDataPacket);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Error al actualizar equipo' });
  } finally {
    connection.release();
  }
};

export const getTeamMembersCount = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT team_id, COUNT(*) as count
      FROM users_group
      GROUP BY team_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(`
      SELECT u.id, u.name, u.avatar
      FROM users u
      JOIN users_group ug ON u.id = ug.user_id
      WHERE ug.team_id = ?
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateTeamMembers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { memberIds } = req.body;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Eliminar miembros actuales
    await connection.query('DELETE FROM users_group WHERE team_id = ?', [id]);

    // Insertar nuevos miembros
    if (memberIds.length > 0) {
      const values = memberIds.map((userId: number) => [id, userId]);
      await connection.query(
        'INSERT INTO users_group (team_id, user_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.json({ message: 'Miembros actualizados exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    connection.release();
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Actualizar usuarios asignados a este equipo
    await connection.query('UPDATE users SET team_id = NULL WHERE team_id = ?', [id]);
    
    // Eliminar el equipo
    await connection.query('DELETE FROM teams WHERE id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Error al eliminar equipo' });
  } finally {
    connection.release();
  }
};



