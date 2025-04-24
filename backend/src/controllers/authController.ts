import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

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
    logger.error('Error en login:', { error });
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

export const getRoles = async (req: Request, res: Response) => {
  try {
    const [roles] = await pool.query('SELECT * FROM role_group ORDER BY name_rol');
    res.json(roles);
  } catch (error) {
    logger.error('Error al obtener roles:', { error });
    res.status(500).json({ message: 'Error al obtener roles' });
  }
};

export const getModules = async (req: Request, res: Response) => {
  try {
    const [modules] = await pool.query('SELECT * FROM modulos ORDER BY modulo_name');
    res.json(modules);
  } catch (error) {
    logger.error('Error al obtener módulos:', { error });
    res.status(500).json({ message: 'Error al obtener módulos' });
  }
};

interface RolePermissionRow extends RowDataPacket {
  modulo_id: number;
  id: number;
  view: number;
  can_create: number;
  edit: number;
  can_delete: number;
  modulo_name: string;
}

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const [permissions] = await pool.query<RolePermissionRow[]>(
      `SELECT rp.*, m.id as moduloId, m.modulo_name 
       FROM role_permissions rp
       RIGHT JOIN modulos m ON rp.modulo_id = m.id AND rp.role_group_id = ?
       ORDER BY m.modulo_name`,
      [roleId]
    );

    // Formatea los permisos para que coincidan con la estructura del frontend
    const formattedPermissions = permissions.map(p => ({
      moduloId: p.modulo_id || p.id,
      view: Boolean(p.view),
      can_create: Boolean(p.can_create),
      edit: Boolean(p.edit),
      can_delete: Boolean(p.can_delete)
    }));

    res.json(formattedPermissions);
  } catch (error) {
    logger.error('Error al obtener permisos:', { error });
    res.status(500).json({ message: 'Error al obtener permisos' });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { roleId } = req.params;
    const { moduleId, ...permissions } = req.body;

    await connection.beginTransaction();

    // Primero obtener los permisos existentes
    const [existingPermissions] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM role_permissions WHERE role_group_id = ? AND modulo_id = ?',
      [roleId, moduleId]
    );

    const currentPermissions = existingPermissions[0] || {
      view: false,
      can_create: false,
      edit: false,
      can_delete: false
    };

    // Actualizar solo el permiso específico manteniendo los demás
    await connection.query(
      `INSERT INTO role_permissions (role_group_id, modulo_id, view, can_create, edit, can_delete)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       view = VALUES(view),
       can_create = VALUES(can_create),
       edit = VALUES(edit),
       can_delete = VALUES(can_delete)`,
      [
        roleId,
        moduleId,
        permissions.view ?? currentPermissions.view,
        permissions.can_create ?? currentPermissions.can_create,
        permissions.edit ?? currentPermissions.edit,
        permissions.can_delete ?? currentPermissions.can_delete
      ]
    );

    await connection.commit();
    res.json({ message: 'Permisos actualizados' });
  } catch (error) {
    await connection.rollback();
    logger.error('Error al actualizar permisos:', { error, roleId: req.params.roleId, moduleId: req.body.moduleId });
    res.status(500).json({ message: 'Error al actualizar permisos' });
  } finally {
    connection.release();
  }
};
