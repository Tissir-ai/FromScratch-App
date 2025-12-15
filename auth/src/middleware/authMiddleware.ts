import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring('Bearer '.length);
  }

  // Fallback to HttpOnly cookie (e.g. after web login)
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'access_token' && value) {
        token = decodeURIComponent(value);
        break;
      }
    }
  }

  if (!token) {
    throw new AppError('Missing authorization token', 401);
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}
