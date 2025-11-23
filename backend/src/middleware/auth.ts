import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    type: string;
  };
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const tokenHeader = req.header('x-auth-token') || req.header('Authorization');

  // Check if no token
  if (!tokenHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  let token = tokenHeader;
  if (tokenHeader.startsWith('Bearer ')) {
    token = tokenHeader.slice(7, tokenHeader.length);
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { user: { id: number; type: string } };
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;
