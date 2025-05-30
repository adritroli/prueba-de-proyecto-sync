import { Request, Response } from 'express';
import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other user properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

export const getPasswords = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const shareFilter = req.query.share_filter;
    const folderId = req.query.folder_id; // Agregar esta línea
    
    let query = '';
    const params: any[] = [userId];

    if (shareFilter === 'shared_by_me') {
      query = `
        SELECT p.*, ps.shared_with_id, u.name as shared_with, 'shared_by_me' as share_type 
        FROM password_entries p 
        INNER JOIN password_shares ps ON p.id = ps.password_id 
        INNER JOIN users u ON u.id = ps.shared_with_id
        WHERE p.user_id = ? AND p.deleted = FALSE
      `;
    } else if (shareFilter === 'shared_with_me') {
      console.log('Fetching passwords shared with user:', userId);
      query = `
        SELECT p.*, ps.owner_id as shared_by, 'shared_with_me' as share_type
        FROM password_entries p 
        INNER JOIN password_shares ps ON p.id = ps.password_id 
        WHERE ps.shared_with_id = ? AND p.deleted = FALSE
      `;
    } else {
      query = `
        SELECT * FROM password_entries 
        WHERE user_id = ?
      `;
      
      // Manejar filtros especiales
      if (folderId === 'favorites') {
        query += ' AND favorite = TRUE AND deleted = FALSE';
      } else if (folderId === 'trash') {
        query += ' AND deleted = TRUE';
      } else if (folderId) {
        query += ' AND folder_id = ? AND deleted = FALSE';
        params.push(folderId);
      } else {
        query += ' AND deleted = FALSE';
      }
    }
    
    console.log('Executing query:', query);
    console.log('Query params:', params);

    const [passwords] = await connection.query(query, params);
    console.log('Query results:', {
      count: Array.isArray(passwords) ? passwords.length : 0,
      firstResult: Array.isArray(passwords) && passwords.length > 0 ? passwords[0] : null
    });

    // Si son contraseñas compartidas conmigo
    if (shareFilter === 'shared_with_me' && Array.isArray(passwords)) {
      console.log('Processing shared_with_me passwords');
      const passwordsWithOwners = await Promise.all(
        passwords.map(async (password: any) => {
          console.log('Fetching owner info for password:', password.id);
          const [ownerResult] = await connection.query(
            'SELECT name, last_name FROM users WHERE id = ?',
            [password.shared_by]
          ) as [any[], any];

          console.log('Owner info:', ownerResult[0]);
          return {
            ...password,
            owner_name: ownerResult[0] ? `${ownerResult[0].name} ${ownerResult[0].last_name}` : 'Desconocido'
          };
        })
      );
      console.log('Final processed passwords:', passwordsWithOwners.length);
      res.json(passwordsWithOwners);
    } else {
      res.json(passwords);
    }
  } catch (error) {
    console.error('Error in getPasswords:', error);
    res.status(500).json({ error: 'Error fetching passwords' });
  } finally {
    connection.release();
  }
};

export const createPassword = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const { title, username, password, url, notes, folder_id } = req.body;
    const id = uuidv4();

    await connection.query(
      `INSERT INTO password_entries 
       (id, user_id, title, username, password, url, notes, folder_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, title, username, password, url, notes, folder_id]
    );

    res.status(201).json({ id, message: 'Password created successfully' });
  } catch (error) {
    console.error('Error in createPassword:', error);
    res.status(500).json({ error: 'Error creating password' });
  } finally {
    connection.release();
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    // Verificar si el usuario es el propietario de la contraseña
    const [ownership] = await connection.query(
      'SELECT user_id FROM password_entries WHERE id = ?',
      [id]
    ) as [Array<{ user_id: string }>, any];

    if (!Array.isArray(ownership) || ownership.length === 0 || ownership[0].user_id !== userId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para editar esta contraseña' 
      });
    }

    // Continuar con la actualización si es el propietario
    if (Object.keys(req.body).length === 1 && 'folder_id' in req.body) {
      await connection.query(
        'UPDATE password_entries SET folder_id = ? WHERE id = ? AND user_id = ?',
        [req.body.folder_id, id, userId]
      );
    } else {
      const { title, username, password, url, notes, folder_id } = req.body;
      await connection.query(
        `UPDATE password_entries 
         SET title = ?, username = ?, password = ?, 
             url = ?, notes = ?, folder_id = ?
         WHERE id = ? AND user_id = ?`,
        [title, username, password, url, notes, folder_id, id, userId]
      );
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    res.status(500).json({ error: 'Error updating password' });
  } finally {
    connection.release();
  }
};

export const deletePassword = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await connection.query(
      'UPDATE password_entries SET deleted = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Error in deletePassword:', error);
    res.status(500).json({ error: 'Error deleting password' });
  } finally {
    connection.release();
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await connection.query(
      'UPDATE password_entries SET favorite = NOT favorite WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Favorite status toggled successfully' });
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({ error: 'Error toggling favorite status' });
  } finally {
    connection.release();
  }
};

// Métodos para carpetas
 export const getFolders = async(req: Request, res: Response) =>{
    const connection = await pool.getConnection();
    try {
      const userId = req.user?.id;
      const [folders] = await connection.query(
        'SELECT * FROM password_folders WHERE user_id = ?',
        [userId]
      );
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching folders' });
    } finally {
      connection.release();
    }
  }

 export const  createFolder = async (req: Request, res: Response):Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!name || !userId) {
       res.status(400).json({ error: 'Nombre y usuario son requeridos' });
    }

    const id = uuidv4();
    const result = await connection.query(
      'INSERT INTO password_folders (id, user_id, name) VALUES (?, ?, ?)',
      [id, userId, name]
    );

    res.status(201).json({ 
      id, 
      name,
      message: 'Folder created successfully' 
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Error creating folder' });
  } finally {
    connection.release();
  }
}

  export const updateFolder = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { name } = req.body;

      await connection.query(
        'UPDATE password_folders SET name = ? WHERE id = ? AND user_id = ?',
        [name, id, userId]
      );

      res.json({ message: 'Folder updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error updating folder' });
    } finally {
      connection.release();
    }
  }

   export const deleteFolder = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      // Primero, actualizar todas las contraseñas de la carpeta a folder_id = NULL
      await connection.query(
        'UPDATE password_entries SET folder_id = NULL WHERE folder_id = ? AND user_id = ?',
        [id, userId]
      );

      // Luego, eliminar la carpeta
      await connection.query(
        'DELETE FROM password_folders WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting folder' });
    } finally {
      connection.release();
    }
  }

  export const restorePassword = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      await connection.query(
        'UPDATE password_entries SET deleted = FALSE WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({ message: 'Password restored successfully' });
    } catch (error) {
      console.error('Error in restorePassword:', error);
      res.status(500).json({ error: 'Error restoring password' });
    } finally {
      connection.release();
    }
  };

  export const restoreMultiplePasswords = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const userId = req.user?.id;
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array' });
      }

      await connection.query(
        'UPDATE password_entries SET deleted = FALSE WHERE id IN (?) AND user_id = ?',
        [ids, userId]
      );

      res.json({ message: 'Passwords restored successfully' });
    } catch (error) {
      console.error('Error in restoreMultiplePasswords:', error);
      res.status(500).json({ error: 'Error restoring passwords' });
    } finally {
      connection.release();
    }
  };

  export const sharePassword = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const { user_id } = req.body;
      const owner_id = req.user?.id;

      // Validar que el usuario existe
      const [users] = await connection.query(
        'SELECT id FROM users WHERE id = ?',
        [user_id]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Validar que la contraseña existe y pertenece al usuario actual
      const [passwords] = await connection.query(
        'SELECT id FROM password_entries WHERE id = ? AND user_id = ?',
        [id, owner_id]
      );

      if (!Array.isArray(passwords) || passwords.length === 0) {
        return res.status(404).json({ error: 'Contraseña no encontrada' });
      }

      // Verificar si ya está compartida
      const [existing] = await connection.query(
        'SELECT id FROM password_shares WHERE password_id = ? AND shared_with_id = ?',
        [id, user_id]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({ error: 'La contraseña ya está compartida con este usuario' });
      }

      // Crear el registro de compartición
      await connection.query(
        'INSERT INTO password_shares (password_id, owner_id, shared_with_id) VALUES (?, ?, ?)',
        [id, owner_id, user_id]
      );

      res.json({ message: 'Contraseña compartida exitosamente' });
    } catch (error) {
      console.error('Error in sharePassword:', error);
      res.status(500).json({ error: 'Error al compartir la contraseña' });
    } finally {
      connection.release();
    }
  };

  export const getSharedUsers = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const owner_id = req.user?.id;

      const [shares] = await connection.query(
        `SELECT u.id, u.name, u.email, ps.created_at as shared_at 
         FROM password_shares ps 
         JOIN users u ON u.id = ps.shared_with_id 
         WHERE ps.password_id = ? AND ps.owner_id = ?`,
        [id, owner_id]
      );

      res.json(shares);
    } catch (error) {
      console.error('Error in getSharedUsers:', error);
      res.status(500).json({ error: 'Error al obtener usuarios compartidos' });
    } finally {
      connection.release();
    }
  };

  export const removeShare = async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    try {
      const { id, userId } = req.params;
      const owner_id = req.user?.id;

      await connection.query(
        'DELETE FROM password_shares WHERE password_id = ? AND shared_with_id = ? AND owner_id = ?',
        [id, userId, owner_id]
      );

      res.json({ message: 'Compartición eliminada exitosamente' });
    } catch (error) {
      console.error('Error in removeShare:', error);
      res.status(500).json({ error: 'Error al eliminar la compartición' });
    } finally {
      connection.release();
    }
  };
