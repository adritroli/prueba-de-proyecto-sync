import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import passwordRoutes from './routes/passwordRoutes';
import dashboardConfigRoutes from './routes/dashboardConfig';


const app = express();

// Configuración básica
app.use(express.json());
app.use(helmet());

// Configuración CORS - eliminar el duplicado
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(requestLogger);
app.use((req, _, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rutas API
app.use('/api', taskRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', sprintRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/kanban', KanbanBoardRoutes);
app.use('/api/linked-tasks', linkedTasksRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documentation' ,documentationRoutes);
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/api/upload', uploadRoutes);
app.use('/api', teamsRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/dashboard', dashboardConfigRoutes);


// Error handling debe ser el último middleware
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