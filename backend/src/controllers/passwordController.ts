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
    const folderId = req.query.folder_id;
    
    let query = `
      SELECT * FROM password_entries 
      WHERE user_id = ? AND deleted = FALSE
    `;
    
    if (folderId) {
      query += ' AND folder_id = ?';
    }
    
    const [passwords] = await connection.query(query, [userId, folderId].filter(Boolean));
    
    res.json(passwords);
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
    const { title, username, password, url, notes, folder_id } = req.body;

    await connection.query(
      `UPDATE password_entries 
       SET title = ?, username = ?, password = ?, 
           url = ?, notes = ?, folder_id = ?
       WHERE id = ? AND user_id = ?`,
      [title, username, password, url, notes, folder_id, id, userId]
    );

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

  export const updateFolder = async (req: Request, res: Response) =>{
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

   export const deleteFolder= async(req: Request, res: Response)=> {
    const connection = await pool.getConnection();
    try {
      const userId = req.user?.id;
      const { id } = req.params;

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
