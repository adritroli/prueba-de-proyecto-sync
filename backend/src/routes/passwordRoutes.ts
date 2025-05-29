import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getPasswords,
  createPassword,
  updatePassword,
  deletePassword,
  toggleFavorite,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
} from '../controllers/passwordController';

const router = Router();

// Proteger rutas individuales con tipado correcto
router.get('/', authenticateToken as any, getPasswords);
router.post('/', authenticateToken as any, createPassword);
router.put('/:id', authenticateToken as any, updatePassword);
router.delete('/:id', authenticateToken as any, deletePassword);
router.put('/:id/favorite', authenticateToken as any, toggleFavorite);

// Rutas de carpetas
router.get('/folders', authenticateToken as any, getFolders);
router.post('/folders', authenticateToken as any, createFolder);
router.put('/folders/:id', authenticateToken as any, updateFolder);
router.delete('/folders/:id', authenticateToken as any, deleteFolder);

export default router;