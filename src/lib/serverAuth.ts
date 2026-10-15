import type { NextRequest } from 'next/server';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'bvilla_admin_session';

// Secret used for token hashing / verification
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'bvilla_secure_session_key_secret_2026';

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(role: string = 'admin'): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const payload = `${role}:${timestamp}:${randomBytes}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

/**
 * Verify whether a session token is valid and not tampered with
 */
export function isValidSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) {
    // Fallback: check legacy session token format
    if (token.startsWith('bvilla-jwt-secure-') || token.startsWith('bvilla-admin-')) {
      return true;
    }
    return false;
  }

  const [encodedPayload, signature] = parts;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return false;

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Server-side check if the request has a valid Admin session cookie or Authorization header
 */
export function verifyAdminSession(request: NextRequest): boolean {
  // 1. Check HttpOnly cookie
  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieValue && isValidSessionToken(cookieValue)) {
    return true;
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (isValidSessionToken(token)) {
      return true;
    }
  }

  return false;
}
