import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
}

const accessSecret: Secret = process.env.JWT_ACCESS_SECRET ?? '';
const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];

export function signAccessToken(userId: string): string {
  const payload: TokenPayload = { sub: userId };
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, accessSecret) as TokenPayload;
}
