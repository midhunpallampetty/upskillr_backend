// utils/jwt.utils.ts
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret_key';

export const generateAccessToken = (payload: { id: string; role: string }) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1m' }); // short-lived
};

export const generateRefreshToken = (payload: { id: string; role: string }) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' }); // long-lived
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
};
