import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });

    // Log métricas de rendimiento
    if (parseFloat(responseTime) > 1000) {
      logger.warn('Slow Request', {
        method: req.method,
        url: req.url,
        responseTime
      });
    }
  });

  next();
};
