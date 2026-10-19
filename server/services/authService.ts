
import { eq, or, sql } from 'drizzle-orm';
import { getDb } from '../../db/index.ts';
import * as schema from '../../db/schema.ts';

export class AuthService {

  /* =========================================================
     FIND USER
  ========================================================= */

  async findUserById(id: string) {
    const db = getDb();

    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  async findUserByEmailOrMatric(identifier: string) {
    const db = getDb();

    return await db.query.users.findFirst({
      where: or(
        eq(schema.users.email, identifier),
        eq(schema.users.matricNumber, identifier)
      ),
    });
  }

  async getAllUsers() {
    const db = getDb();

    return await db
      .select()
      .from(schema.users);
  }

  /* =========================================================
     ADMIN CHECK
  ========================================================= */

  async hasAnyAdmin() {
    const db = getDb();

    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(schema.users)
      .where(
        eq(schema.users.role, 'admin')
      );

    return Number(result[0]?.count || 0) > 0;
  }

  /* =========================================================
     CREATE USER
  ========================================================= */

  async createUser(
    user: typeof schema.users.$inferInsert
  ) {
    const db = getDb();

    const result = await db
      .insert(schema.users)
      .values(user)
      .returning();

    return result[0];
  }

  /* =========================================================
     SAVE USER
     
     This method is important because the auth routes
     already call authService.saveUser().
     
     If the ID already exists, update the user.
     Otherwise, create a new user.
  ========================================================= */

  async saveUser(
    user: typeof schema.users.$inferInsert
  ) {
    const db = getDb();

    const existingUser = await this.findUserById(
      String(user.id)
    );

    if (existingUser) {
      const result = await db
        .update(schema.users)
        .set({
          ...user,
          updatedAt: new Date(),
        })
        .where(
          eq(schema.users.id, String(user.id))
        )
        .returning();

      return result[0];
    }

    const result = await db
      .insert(schema.users)
      .values({
        ...user,
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  /* =========================================================
     UPDATE USER
  ========================================================= */

  async updateUser(
    id: string,
    data: Partial<typeof schema.users.$inferInsert>
  ) {
    const db = getDb();

    const result = await db
      .update(schema.users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        eq(schema.users.id, id)
      )
      .returning();

    return result[0];
  }

  /* =========================================================
     LOGIN STATE
  ========================================================= */

  async updateLoginState(userId: string) {
    const db = getDb();

    const result = await db
      .update(schema.users)
      .set({
        updatedAt: new Date(),
      })
      .where(
        eq(schema.users.id, userId)
      )
      .returning();

    return result[0];
  }

  /* =========================================================
     CREATE SESSION
  ========================================================= */

  async createSession(
    userId: string,
    role: string,
    token: string,
    ip: string,
    userAgent: string
  ) {
    const db = getDb();

    const expiresAt = new Date(
      Date.now() +
      24 * 60 * 60 * 1000
    );

    const result = await db
      .insert(schema.sessions)
      .values({
        id: crypto.randomUUID(),
        token,
        userId,
        role,
        expiresAt,
        ip,
        userAgent,
      })
      .returning();

    return result[0];
  }

  /* =========================================================
     GET SESSION
  ========================================================= */

  async getSession(token: string) {
    const db = getDb();

    const session =
      await db.query.sessions.findFirst({
        where: eq(
          schema.sessions.token,
          token
        ),
      });

    if (!session) {
      return undefined;
    }

    if (
      session.expiresAt.getTime() <
      Date.now()
    ) {
      await this.invalidateSession(token);

      return undefined;
    }

    return session;
  }

  /* =========================================================
     INVALIDATE ONE SESSION
  ========================================================= */

  async invalidateSession(token: string) {
    const db = getDb();

    await db
      .delete(schema.sessions)
      .where(
        eq(schema.sessions.token, token)
      );
  }

  /* =========================================================
     INVALIDATE ALL USER SESSIONS
  ========================================================= */

  async invalidateAllUserSessions(
    userId: string
  ) {
    const db = getDb();

    await db
      .delete(schema.sessions)
      .where(
        eq(schema.sessions.userId, userId)
      );
  }

  /* =========================================================
     PASSWORD RESET TOKEN
  ========================================================= */

  async createPasswordResetToken(
    userId: string,
    rawToken: string,
    ttlMinutes: number = 15
  ) {
    const db = getDb();

    const expiresAt = new Date(
      Date.now() +
      ttlMinutes * 60 * 1000
    );

    const result = await db
      .insert(
        schema.passwordResetTokens
      )
      .values({
        id: crypto.randomUUID(),
        hashedToken: rawToken,
        userId,
        expiresAt,
        used: false,
      })
      .returning();

    return result[0];
  }

  async verifyResetToken(
    rawToken: string
  ) {
    const db = getDb();

    const reset =
      await db.query.passwordResetTokens.findFirst({
        where: eq(
          schema.passwordResetTokens.hashedToken,
          rawToken
        ),
      });

    if (
      !reset ||
      reset.used ||
      reset.expiresAt.getTime() < Date.now()
    ) {
      return {
        valid: false,
      };
    }

    return {
      valid: true,
      userId: reset.userId,
    };
  }

  async consumeResetToken(
    rawToken: string
  ) {
    const db = getDb();

    const result = await db
      .update(
        schema.passwordResetTokens
      )
      .set({
        used: true,
      })
      .where(
        eq(
          schema.passwordResetTokens.hashedToken,
          rawToken
        )
      );

    return result.rowCount
      ? result.rowCount > 0
      : false;
  }
}

export const authService =
  new AuthService();

