import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';


export const createUser = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { name, username, email, password, team_id, role_group_id } = req.body;

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validar datos requeridos
    if (!name || !username || !email || !hashedPassword || !team_id || !role_group_id) {
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }
    
    await connection.beginTransaction();

    // Crear el usuario
    const [result]: any = await connection.query(
      `INSERT INTO users (name, username, email, password, team_id, role_group_id, user_status, audit_date)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [name, username, email, hashedPassword, team_id, role_group_id]
    );

    // Obtener el usuario creado con todos sus datos
    const [newUser]: any = await connection.query(
      `SELECT u.*, t.team_name, rg.name_rol
       FROM users u
       JOIN teams t ON u.team_id = t.id
       JOIN role_group rg ON u.role_group_id = rg.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    await connection.commit();
    res.status(201).json(newUser[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  } finally {
    connection.release();
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const roleFilter = req.query.role as string;
    const teamFilter = req.query.team as string;
    const statusFilter = req.query.status as string;

    let query = `
      SELECT 
        u.id, u.name, u.username, u.email, u.avatar,
        u.user_status, u.connection_status, u.last_connection,
        u.last_name, u.created_at, u.updated_at,
        t.id as team_id, t.team_name,
        rg.id as role_group_id, rg.name_rol
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN role_group rg ON u.role_group_id = rg.id
      WHERE u.user_status != 'deleted'
    `;
    
    const params: any[] = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (roleFilter && roleFilter !== 'all') {
      query += ` AND u.role_group_id = ?`;
      params.push(roleFilter);
    }

    if (teamFilter && teamFilter !== 'all') {
      query += ` AND u.team_id = ?`;
      params.push(teamFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      query += ` AND u.user_status = ?`;
      params.push(statusFilter);
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM (${query}) as sub`,
      params
    );
    const total = (countResult as any)[0].total;

    // Add pagination
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const [users] = await pool.query(query, params);

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_status } = req.body;

    await pool.query('UPDATE users SET user_status = ? WHERE id = ?', [user_status, id]);
    
    res.json({ message: 'Status actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar status:', error);
    res.status(500).json({ message: 'Error al actualizar status' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_group_id } = req.body;

    await pool.query('UPDATE users SET role_group_id = ? WHERE id = ?', [role_group_id, id]);
    
    res.json({ message: 'Rol actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};

export const updateUserTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { team_id } = req.body;

    await pool.query('UPDATE users SET team_id = ? WHERE id = ?', [team_id, id]);
    
    res.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ message: 'Error al actualizar equipo' });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT id, name_rol FROM role_group');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
};

export const adrian = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT u.*, t.team_name, rg.name_rol
       FROM users u
       JOIN teams t ON u.team_id = t.id
       JOIN role_group rg ON u.role_group_id = rg.id
       WHERE u.id = 1;
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT id, team_name FROM teams');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ message: 'Error al obtener equipos' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET user_status = "deleted" WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, username, email, team_id, role_group_id } = req.body;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE users 
       SET name = ?, username = ?, email = ?, 
           team_id = ?, role_group_id = ?, modif_date = NOW()
       WHERE id = ?`,
      [name, username, email, team_id, role_group_id, id]
    );

    const [updatedUser]: any = await connection.query(
      `SELECT u.*, t.team_name, rg.name_rol
       FROM users u
       JOIN teams t ON u.team_id = t.id
       JOIN role_group rg ON u.role_group_id = rg.id
       WHERE u.id = ?`,
      [id]
    );

    await connection.commit();
    res.json(updatedUser[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  } finally {
    connection.release();
  }
};
