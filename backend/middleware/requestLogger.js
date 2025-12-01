import logger from '../config/logger.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'response',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};
