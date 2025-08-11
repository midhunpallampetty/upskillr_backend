// controllers/auth.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt';
import {Admin} from '../models/admin.model';
import {School} from '../models/school.model';
import {Student} from '../models/student.model';

export const refreshTokenController = async (req: Request, res: Response):Promise<any> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken); // { id, role }
    if (!decoded) return res.status(403).json({ message: 'Invalid refresh token' });

    const { id, role } = decoded;
    let user;

    switch (role) {
      case 'admin':
        user = await Admin.findById(id);
        break;
      case 'school':
        user = await School.findById(id);
        break;
      case 'student':
        user = await Student.findById(id);
        break;
      default:
        return res.status(401).json({ message: 'Invalid role' });
    }

    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = generateAccessToken({ id, role });
    const newRefreshToken = generateRefreshToken({ id, role });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
} catch (err: any) {
  console.error('🔴 Refresh Token Error:', err);
  return res.status(500).json({ message: 'Something went wrong', error: err.message || err });
}

};
 export const testApi = async (_req: Request, res: Response) => {
    res.status(200).json({ message: '✅ Test API is working fine!' });
  };
