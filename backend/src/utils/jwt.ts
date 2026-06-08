import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: { id: string; role: string; email: string }): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};
