import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export interface TokenPayload {
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: { email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function isAuthenticated(token: string | undefined): boolean {
  if (!token) return false;
  return verifyToken(token) !== null;
}