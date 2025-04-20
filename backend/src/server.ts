import express from 'express';
import cors from 'cors';
import userRoutes from './routes/usersRoutes';
import teamsRoutes from './routes/teamsRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import KanbanBoardRoutes from './routes/kanbanBoardRoutes';
import linkedTasksRoutes from './routes/linkedTasksRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import documentationRoutes from './routes/documentationRoutes';
import sprintRoutes from './routes/sprintRoutes';
import uploadRoutes from './routes/uploadRoutes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', userRoutes);
app.use('/api', teamsRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);
app.use('/api', linkedTasksRoutes);  // Agregar nuevas rutas
app.use('/api/auth', authRoutes);
app.use('/api', KanbanBoardRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api', sprintRoutes);
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});