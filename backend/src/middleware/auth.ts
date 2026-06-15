import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Check Authorization: Bearer <token> header first (for cross-origin dev),
    // then fall back to HttpOnly cookie (for production)
    let token: string | undefined = req.cookies.jwt;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized - No token provided' });
      return;
    }

    // JWT signature verification is the security gate — no DB roundtrip needed.
    // The payload (id, role, email) was signed at login and cannot be tampered with.
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};


export const requireRole = (role: 'CLIENT' | 'FREELANCER') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ error: `Forbidden - Requires ${role} role` });
      return;
    }

    next();
  };
};
