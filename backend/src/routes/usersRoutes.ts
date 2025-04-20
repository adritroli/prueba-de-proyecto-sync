import { Router } from 'express';
import { createUser, getRoles, getUsers, getTeams, updateUserRole, updateUserStatus, adrian, updateUserTeam, deleteUser, updateUser } from '../controllers/usersController';

const router = Router();

router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/team', updateUserTeam);
router.get('/roles', getRoles);

router.get('/users', getUsers);
router.get('/adrian', adrian);
router.get('/teams', getTeams);

router.post('/users', createUser);

router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

export default router;
