import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${req.method}] ${req.url} -`, err.message);

  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({ msg: message });
};
