
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction):any => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. Token not provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token,ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};
