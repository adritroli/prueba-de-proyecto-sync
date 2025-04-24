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

export const errorMiddleware = (err: Error, req: Request, res: Response) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body
  });

  res.status(500).json({ 
    message: 'Internal server error',
    errorId: Date.now() // Para rastrear errores específicos
  });
};
