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
  restorePassword,
  restoreMultiplePasswords,
  sharePassword,
  getSharedUsers,
  removeShare,
} from '../controllers/passwordController';

const router = Router();

// Proteger rutas individuales con tipado correcto
router.get('/', authenticateToken as any, getPasswords);
router.post('/', authenticateToken as any, createPassword);
router.put('/:id', authenticateToken as any, (req, res, next) => {
  Promise.resolve(updatePassword(req, res)).catch(next);
});
router.delete('/:id', authenticateToken as any, deletePassword);
router.put('/:id/favorite', authenticateToken as any, toggleFavorite);
router.put('/:id/restore', authenticateToken as any, restorePassword);
router.put('/restore-multiple', authenticateToken as any, (req, res, next) => {
  Promise.resolve(restoreMultiplePasswords(req, res)).catch(next);
});
router.post('/:id/share', authenticateToken as any, (req, res, next) => {
  Promise.resolve(sharePassword(req, res)).catch(next);
});
router.get('/:id/shares', authenticateToken as any, getSharedUsers);
router.delete('/:id/shares/:userId', authenticateToken as any, removeShare);

// Rutas de carpetas
router.get('/folders', authenticateToken as any, getFolders);
router.post('/folders', authenticateToken as any, createFolder);
router.put('/folders/:id', authenticateToken as any, updateFolder);
router.delete('/folders/:id', authenticateToken as any, deleteFolder);

export default router;