import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface UserResult extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string;
  role_group_id: number;
  name_rol: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const [userRows] = await pool.query<UserResult[]>(`
      SELECT u.*, rg.name_rol 
      FROM users u
      JOIN role_group rg ON u.role_group_id = rg.id
      WHERE u.email = ?`, 
      [email]
    );

    if (userRows.length === 0) {
       res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = userRows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
       res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'secret'
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role_group_id: user.role_group_id,
        name_rol: user.name_rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Primero obtenemos el role_group_id del usuario
    const userQuery = `
      SELECT role_group_id 
      FROM users 
      WHERE id = ?
    `;
    
    const [userResult] = await pool.query<UserResult[]>(userQuery, [userId]);
    const roleGroupId = userResult[0]?.role_group_id;

    if (!roleGroupId) {
      return res.status(404).json({ message: 'Usuario o rol no encontrado' });
    }

    // Luego obtenemos los permisos asociados a ese rol
    const permissionsQuery = `
      SELECT 
        m.modulo_name,
        rp.view,
        rp.create,
        rp.edit,
        rp.delete,
        rg.name_rol
      FROM role_permissions rp
      JOIN modulos m ON rp.modulo_id = m.id
      JOIN role_group rg ON rp.role_group_id = rg.id
      WHERE rp.role_group_id = ?
    `;

    const [permissions] = await pool.query(permissionsQuery, [roleGroupId]);
    
    res.json(permissions);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
