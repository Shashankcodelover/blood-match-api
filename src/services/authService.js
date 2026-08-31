/**
 * LifeStream V4 - Authentication, Cryptography & Token Service
 * Uses Node.js crypto for PBKDF2 password hashing and HMAC-SHA256 signed session tokens.
 */

const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'lifestream-emergency-jwt-secret-key-2026-production';

// Hash password with salt using PBKDF2
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// Verify password
function verifyPassword(password, hash, salt) {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return check === hash;
}

// Generate Base64Url string
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

// Generate HMAC-SHA256 Token
function generateToken(payload, expiresInHours = 48) {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;
  const body = JSON.stringify({ ...payload, exp: expiresAt });

  const encodedHeader = base64UrlEncode(header);
  const encodedBody = base64UrlEncode(body);

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

// Verify and decode token
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedBody, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    return null; // Invalid signature
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedBody));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Generate cryptographic SHA-256 Chain-of-Custody seal for blood units
function generateCustodySeal(bloodType, donorId, hospitalId, timestamp = Date.now()) {
  const payload = `${bloodType}-${donorId}-${hospitalId}-${timestamp}-LIFESTREAM-COLDCHAIN-SECURED`;
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16).toUpperCase();
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateCustodySeal
};
