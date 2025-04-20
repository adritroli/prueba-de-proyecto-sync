import { RequestHandler } from 'express';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

interface UserRecord extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  avatar: string;
  banner_url: string;
}

export const uploadUserImage: RequestHandler = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId } = req.params;
    const { type } = req.query;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No se subió ningún archivo' });
      return;
    }

    const filename = `${type}_${userId}_${Date.now()}${path.extname(file.originalname)}`;
    const publicPath = type === 'banner' ? '/banners/' : '/avatars/';
    const uploadDir = path.join(__dirname, '../../../public', publicPath);

    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const columnToUpdate = type === 'banner' ? 'banner_url' : 'avatar';
    const fileUrl = `${publicPath}${filename}`;

    await connection.query(
      `UPDATE users SET ${columnToUpdate} = ? WHERE id = ?`,
      [fileUrl, userId]
    );

    const [updatedUser] = await connection.query<UserRecord[]>(
      'SELECT id, username, email, avatar, banner_url FROM users WHERE id = ?',
      [userId]
    );

    await connection.commit();
    res.json(updatedUser[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error en la subida:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  } finally {
    connection.release();
  }
};
