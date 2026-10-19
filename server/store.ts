import { HashedPassword, hashPassword, verifyPassword, hashToken } from './security';

export interface StoredUser {
  id: string;
  fullName: string;
  matricNumber: string;
  email: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  level: string;
  discipline: string;
  role: 'student' | 'exco' | 'admin';
  post?: string;
  duesStatus: 'Paid' | 'Pending' | 'Exempted';
  idCardStatus: 'Ready' | 'Processing' | 'Not Registered';
  attendance: number;
  resources: number;
  passwordHash?: HashedPassword; // NEVER stored in plain text!
  createdAt: string;
  updatedAt: string;
  isAccountActive: boolean;
}

export interface ActiveSession {
  token: string;
  userId: string;
  role: 'student' | 'exco' | 'admin';
  createdAt: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}

export interface PasswordResetTokenRecord {
  hashedToken: string;
  userId: string;
  expiresAt: number;
  used: boolean;
}

export interface RateLimitEntry {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

// In-Memory Data Store (Can also be backed by file storage)
class SecurityStore {
  private users: Map<string, StoredUser> = new Map();
  private sessions: Map<string, ActiveSession> = new Map();
  private resetTokens: Map<string, PasswordResetTokenRecord> = new Map();
  private rateLimits: Map<string, RateLimitEntry> = new Map();

  constructor() {
    this.seedInitialRoster();
  }

  /**
   * Initializes departmental student profiles for academic records.
   * CRITICAL SECURITY DIRECTIVE: NO PRE-CREATED PASSWORDS!
   * Students MUST self-register to set their own secure passwords.
   */
  private seedInitialRoster() {
    // Initial academic roster without pre-set passwords.
    // Students claim and register their account through the secure registration flow.
    const initialProfiles: Omit<StoredUser, 'passwordHash' | 'createdAt' | 'updatedAt' | 'isAccountActive'>[] = [
      {
        id: 'usr-1',
        fullName: 'Olatunji Michael Adebayo',
        matricNumber: 'LASU/STECH/PHY/22/0045',
        email: 'olatunji.michael@student.lasustech.edu.ng',
        phoneNumber: '+2348023456789',
        level: '400 Level',
        discipline: 'Theoretical & Astrophysics',
        role: 'student',
        post: 'Chapter President',
        duesStatus: 'Paid',
        idCardStatus: 'Ready',
        attendance: 98,
        resources: 42
      },
      {
        id: 'usr-2',
        fullName: 'Owolabi Grace Oluwafunmilayo',
        matricNumber: 'LASU/STECH/PHY/23/0112',
        email: 'owolabi.grace@student.lasustech.edu.ng',
        phoneNumber: '+2348105638170',
        level: '300 Level',
        discipline: 'Radiation & Health Physics',
        role: 'student',
        post: 'Lady Vice-President',
        duesStatus: 'Paid',
        idCardStatus: 'Ready',
        attendance: 95,
        resources: 38
      },
      {
        id: 'usr-3',
        fullName: 'Babatunde Adewale Peter',
        matricNumber: 'LASU/STECH/PHY/24/0089',
        email: 'babatunde.peter@student.lasustech.edu.ng',
        phoneNumber: '+2347031122334',
        level: '100 Level',
        discipline: 'Physics (General)',
        role: 'student',
        post: 'Student Member',
        duesStatus: 'Pending',
        idCardStatus: 'Not Registered',
        attendance: 84,
        resources: 12
      }
    ];

    const now = new Date().toISOString();
    for (const p of initialProfiles) {
      this.users.set(p.id, {
        ...p,
        createdAt: now,
        updatedAt: now,
        isAccountActive: true
        // passwordHash is intentionally undefined! User must register their password.
      });
    }
  }

  // --- User Queries ---
  public findUserById(id: string): StoredUser | undefined {
    return this.users.get(id);
  }

  public findUserByEmailOrMatric(identifier: string): StoredUser | undefined {
    const clean = identifier.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (
        user.email.toLowerCase() === clean ||
        user.matricNumber.toLowerCase() === clean
      ) {
        return user;
      }
    }
    return undefined;
  }

  public getAllUsers(): StoredUser[] {
    return Array.from(this.users.values());
  }

  public hasAnyAdmin(): boolean {
    for (const user of this.users.values()) {
      if (user.role === 'admin' && user.passwordHash) {
        return true;
      }
    }
    return false;
  }

  public saveUser(user: StoredUser): void {
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
  }

  // --- Session Management ---
  public createSession(userId: string, role: 'student' | 'exco' | 'admin', token: string, ip: string, userAgent: string): ActiveSession {
    const now = Date.now();
    const durationMs = 24 * 60 * 60 * 1000; // 24 hours
    const session: ActiveSession = {
      token,
      userId,
      role,
      createdAt: now,
      expiresAt: now + durationMs,
      ip,
      userAgent
    };
    this.sessions.set(token, session);
    return session;
  }

  public getSession(token: string): ActiveSession | undefined {
    const session = this.sessions.get(token);
    if (!session) return undefined;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return undefined;
    }
    return session;
  }

  public invalidateSession(token: string): void {
    this.sessions.delete(token);
  }

  public invalidateAllUserSessions(userId: string): void {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }

  // --- Password Reset Tokens ---
  public createPasswordResetToken(userId: string, rawToken: string, ttlMinutes: number = 15): PasswordResetTokenRecord {
    const hashed = hashToken(rawToken);
    const record: PasswordResetTokenRecord = {
      hashedToken: hashed,
      userId,
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
      used: false
    };
    this.resetTokens.set(hashed, record);
    return record;
  }

  public verifyResetToken(rawToken: string): { valid: boolean; userId?: string } {
    const hashed = hashToken(rawToken);
    const record = this.resetTokens.get(hashed);
    if (!record || record.used || Date.now() > record.expiresAt) {
      return { valid: false };
    }
    return { valid: true, userId: record.userId };
  }

  public consumeResetToken(rawToken: string): boolean {
    const hashed = hashToken(rawToken);
    const record = this.resetTokens.get(hashed);
    if (!record || record.used || Date.now() > record.expiresAt) {
      return false;
    }
    record.used = true;
    return true;
  }

  // --- Rate Limiting & Brute Force Prevention ---
  public checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000, lockMs: number = 15 * 60 * 1000): {
    allowed: boolean;
    remainingAttempts: number;
    lockedUntil?: number;
    retryAfterSeconds?: number;
  } {
    const now = Date.now();
    const entry = this.rateLimits.get(key);

    if (entry && entry.lockedUntil && entry.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil: entry.lockedUntil,
        retryAfterSeconds
      };
    }

    if (!entry || now - entry.firstAttemptTime > windowMs) {
      return {
        allowed: true,
        remainingAttempts: maxAttempts
      };
    }

    if (entry.attempts >= maxAttempts) {
      const lockedUntil = now + lockMs;
      entry.lockedUntil = lockedUntil;
      const retryAfterSeconds = Math.ceil(lockMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockedUntil,
        retryAfterSeconds
      };
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - entry.attempts
    };
  }

  public recordFailedAttempt(key: string, maxAttempts: number = 5, lockMs: number = 15 * 60 * 1000): {
    locked: boolean;
    remainingAttempts: number;
    retryAfterSeconds?: number;
  } {
    const now = Date.now();
    let entry = this.rateLimits.get(key);

    if (!entry) {
      entry = {
        attempts: 1,
        firstAttemptTime: now
      };
      this.rateLimits.set(key, entry);
      return { locked: false, remainingAttempts: maxAttempts - 1 };
    }

    entry.attempts += 1;
    if (entry.attempts >= maxAttempts) {
      entry.lockedUntil = now + lockMs;
      return {
        locked: true,
        remainingAttempts: 0,
        retryAfterSeconds: Math.ceil(lockMs / 1000)
      };
    }

    return {
      locked: false,
      remainingAttempts: maxAttempts - entry.attempts
    };
  }

  public resetRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }
}

export const securityStore = new SecurityStore();
