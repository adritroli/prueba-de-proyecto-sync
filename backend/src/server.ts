import express from 'express';
import { requestLogger } from './middleware/logger';
import logger from './utils/logger';
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
import { errorMiddleware } from './middleware/performance';

const app = express();

// Middleware de logging
app.use(requestLogger);

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

// Manejo de errores global
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { 
    error: error.message,
    stack: error.stack 
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { 
    reason, 
    promise 
  });
});