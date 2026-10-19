
import crypto from 'node:crypto';

const PASSWORD_ITERATIONS = 100000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');

  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST
    )
    .toString('hex');

  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedPassword: string
): boolean {
  try {
    if (
      typeof password !== 'string' ||
      typeof storedPassword !== 'string'
    ) {
      return false;
    }

    const parts = storedPassword.split(':');

    if (parts.length !== 2) {
      return false;
    }

    const [salt, storedHash] = parts;

    if (
      !/^[a-f0-9]{32}$/i.test(salt) ||
      !/^[a-f0-9]{128}$/i.test(storedHash)
    ) {
      return false;
    }

    const calculatedHash = crypto.pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST
    );

    const expectedHash = Buffer.from(storedHash, 'hex');

    return crypto.timingSafeEqual(
      calculatedHash,
      expectedHash
    );
  } catch {
    return false;
  }
}

export function generateSecureToken(length = 32): string {
  if (!Number.isInteger(length) || length < 16 || length > 128) {
    throw new Error('Token length must be between 16 and 128 bytes.');
  }

  return crypto.randomBytes(length).toString('hex');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeInput(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export function validatePasswordStrength(password: string) {
  if (typeof password !== 'string' || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long.',
    };
  }

  return {
    isValid: true,
    message: '',
  };
}