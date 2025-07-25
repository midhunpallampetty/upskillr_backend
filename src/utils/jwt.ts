import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const generateAccessToken = (payload: object) => {
  console.log(process.env.ACCESS_TOKEN_SECRET,'hello');
  
  return jwt.sign(payload, "access_secret", { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload,"refresh_secret", { expiresIn: '7d' });
};

export const verifyRefreshToken = (token: string) => {  
  return jwt.verify(token, REFRESH_SECRET);
};
