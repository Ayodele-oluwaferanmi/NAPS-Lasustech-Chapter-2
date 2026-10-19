import { db, isDatabaseConfigured } from '../db';
import * as schema from '../../db/schema';
import { eq, or } from 'drizzle-orm';
import { hashToken } from '../security';

function requireDb() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_UNCONFIGURED');
  }
}

export class AuthRepository {
  async getSession(token: string) {
    requireDb();
    const rows = await db.select().from(schema.sessions).where(eq(schema.sessions.token, token));
    return rows[0] ?? null;
  }

  async findUserById(id: string) {
    requireDb();
    const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return rows[0] ?? null;
  }

  async findUserByEmailOrMatric(identifier: string) {
    requireDb();
    const needle = identifier.trim().toLowerCase();
    const rows = await db.select().from(schema.users).where(
      or(eq(schema.users.email, needle), eq(schema.users.matricNumber, needle.toUpperCase()))
    );
    return rows[0] ?? null;
  }

  async saveUser(user: any) {
    requireDb();
    const rows = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
    if (rows.length) {
      await (db.update(schema.users) as any).set({
        fullName: user.fullName,
        matricNumber: user.matricNumber,
        email: user.email,
        phoneNumber: user.phoneNumber,
        whatsappNumber: user.whatsappNumber,
        level: user.level,
        discipline: user.discipline,
        role: user.role,
        post: user.post,
        duesStatus: user.duesStatus,
        idCardStatus: user.idCardStatus,
        attendance: user.attendance,
        resources: user.resources,
        passwordHash: user.passwordHash ? JSON.stringify(user.passwordHash) : null,
        updatedAt: new Date(user.updatedAt || new Date().toISOString()),
        isAccountActive: Boolean(user.isAccountActive)
      } as any).where(eq(schema.users.id, user.id));
    } else {
      await (db.insert(schema.users) as any).values({
        id: user.id,
        fullName: user.fullName,
        matricNumber: user.matricNumber,
        email: user.email,
        phoneNumber: user.phoneNumber,
        whatsappNumber: user.whatsappNumber,
        level: user.level,
        discipline: user.discipline,
        role: user.role,
        post: user.post,
        duesStatus: user.duesStatus,
        idCardStatus: user.idCardStatus,
        attendance: user.attendance,
        resources: user.resources,
        passwordHash: user.passwordHash ? JSON.stringify(user.passwordHash) : null,
        createdAt: new Date(user.createdAt || new Date().toISOString()),
        updatedAt: new Date(user.updatedAt || new Date().toISOString()),
        isAccountActive: Boolean(user.isAccountActive)
      } as any);
    }
    return user;
  }

  async createSession(userId: string, role: string, token: string, ip: string, userAgent: string) {
    requireDb();
    await (db.insert(schema.sessions) as any).values({
      id: `session-${Date.now()}`,
      token,
      userId,
      role,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ip,
      userAgent
    } as any);
    return token;
  }

  async invalidateSession(token: string) {
    requireDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
    return true;
  }

  async invalidateAllUserSessions(userId: string) {
    requireDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
    return true;
  }

  async checkRateLimit(key: string, limit: number, windowMs: number, lockMs: number) {
    requireDb();
    const rows = await db.select().from(schema.rateLimitAttempts).where(eq(schema.rateLimitAttempts.key, key));
    const row = rows[0] ?? null;
    const now = Date.now();
    if (!row) {
      return { allowed: true, retryAfterSeconds: 0, remainingAttempts: limit };
    }
    if (row.lockedUntil && row.lockedUntil > now) {
      return { allowed: false, retryAfterSeconds: Math.ceil((row.lockedUntil - now) / 1000), remainingAttempts: 0, locked: true };
    }
    return { allowed: row.attempts < limit, retryAfterSeconds: 0, remainingAttempts: Math.max(0, limit - row.attempts) };
  }

  async recordFailedAttempt(key: string) {
    requireDb();
    const rows = await db.select().from(schema.rateLimitAttempts).where(eq(schema.rateLimitAttempts.key, key));
    if (!rows.length) {
      await (db.insert(schema.rateLimitAttempts) as any).values({ id: `rl-${Date.now()}`, key, attempts: 1, firstAttemptTime: Date.now(), lockedUntil: null } as any);
      return { remainingAttempts: 4, locked: false, retryAfterSeconds: 0 };
    }
    const row = rows[0];
    const attempts = row.attempts + 1;
    const now = Date.now();
    const lockedUntil = attempts >= 5 ? now + 15 * 60 * 1000 : null;
    await (db.update(schema.rateLimitAttempts) as any).set({ attempts, firstAttemptTime: row.firstAttemptTime, lockedUntil: lockedUntil as any } as any).where(eq(schema.rateLimitAttempts.key, key));
    if (lockedUntil) {
      return { remainingAttempts: 0, locked: true, retryAfterSeconds: 900 };
    }
    return { remainingAttempts: Math.max(0, 5 - attempts), locked: false, retryAfterSeconds: 0 };
  }

  async resetRateLimit(key: string) {
    requireDb();
    await db.delete(schema.rateLimitAttempts).where(eq(schema.rateLimitAttempts.key, key));
    return true;
  }

  async hasAnyAdmin() {
    requireDb();
    const rows = await db.select().from(schema.users).where(eq(schema.users.role, 'admin'));
    return rows.length > 0;
  }

  async createPasswordResetToken(userId: string, rawToken: string, minutes: number) {
    requireDb();
    const hashedToken = hashToken(rawToken);
    await (db.insert(schema.passwordResetTokens) as any).values({
      id: `prt-${Date.now()}`,
      hashedToken,
      userId,
      expiresAt: new Date(Date.now() + minutes * 60 * 1000),
      used: false
    } as any);
    return rawToken;
  }

  async verifyResetToken(token: string) {
    requireDb();
    const hashed = hashToken(token);
    const rows = await db.select().from(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.hashedToken, hashed));
    const row = rows[0] ?? null;
    if (!row || row.used || row.expiresAt < new Date()) {
      return { valid: false, userId: null };
    }
    return { valid: true, userId: row.userId };
  }

  async consumeResetToken(token: string) {
    requireDb();
    const hashed = hashToken(token);
    await (db.update(schema.passwordResetTokens) as any).set({ used: true } as any).where(eq(schema.passwordResetTokens.hashedToken, hashed));
    return true;
  }
}

export const authRepository = new AuthRepository();
