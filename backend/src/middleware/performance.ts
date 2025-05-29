import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    
    logger.info('Request processed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${time.toFixed(2)}ms`
    });
  });

  next();
};

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    environment: process.env.NODE_ENV || 'development',
    service: 'documentation-service',
    timestamp: new Date().toISOString()
  });

  // Log request details
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${Date.now() - (req.startTime || Date.now())}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    environment: process.env.NODE_ENV || 'development',
    service: 'documentation-service',
    timestamp: new Date().toISOString()
  });

  // Send error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${Date.now() - (req.startTime ?? Date.now())}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      environment: process.env.NODE_ENV || 'development',
      service: 'documentation-service',
      timestamp: new Date().toISOString()
    });
  });

  next();
};

// Extender la interfaz Request para incluir startTime
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
    }
  }
}
