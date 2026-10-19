import { Router, Response } from 'express';
import { eq, desc } from 'drizzle-orm';

import { getDb } from './db/index.ts';
import * as schema from './db/schema.ts';
import {
  AuthRequest,
  requireAuth,
  requireAdmin
} from './authRoutes.ts';

export const userRouter = Router();

/* =========================================================
   GET CURRENT USER PROFILE
   GET /api/users/me
========================================================= */

userRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'User not authenticated.'
      });
    }

    const {
      passwordHash,
      ...safeUser
    } = user;

    return res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Get current user error:', error);

    return res.status(500).json({
      error: 'Failed to retrieve user profile.'
    });
  }
});


/* =========================================================
   GET ALL USERS
   ADMIN ONLY

   GET /api/users
========================================================= */

userRouter.get('/', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const db = getDb();

    const users = await db
      .select({
        id: schema.users.id,
        fullName: schema.users.fullName,
        matricNumber: schema.users.matricNumber,
        email: schema.users.email,
        phoneNumber: schema.users.phoneNumber,
        whatsappNumber: schema.users.whatsappNumber,
        level: schema.users.level,
        discipline: schema.users.discipline,
        role: schema.users.role,
        post: schema.users.post,
        duesStatus: schema.users.duesStatus,
        idCardStatus: schema.users.idCardStatus,
        attendance: schema.users.attendance,
        resources: schema.users.resources,
        profileImage: schema.users.profileImage,
        isAccountActive: schema.users.isAccountActive,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt
      })
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);

    return res.status(500).json({
      error: 'Failed to retrieve users.'
    });
  }
});


/* =========================================================
   GET USER BY ID
   ADMIN ONLY

   GET /api/users/:id
========================================================= */

userRouter.get('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, req.params.id)
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    const {
      passwordHash,
      ...safeUser
    } = user;

    return res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Get user error:', error);

    return res.status(500).json({
      error: 'Failed to retrieve user.'
    });
  }
});


/* =========================================================
   UPDATE CURRENT USER PROFILE

   PUT /api/users/me
========================================================= */

userRouter.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'User not authenticated.'
      });
    }

    const {
      fullName,
      phoneNumber,
      whatsappNumber,
      birthday,
      gender,
      profileImage
    } = req.body;

    const db = getDb();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (typeof fullName === 'string' && fullName.trim().length >= 3) {
      updateData.fullName = fullName.trim();
    }

    if (typeof phoneNumber === 'string') {
      updateData.phoneNumber = phoneNumber.trim();
    }

    if (typeof whatsappNumber === 'string') {
      updateData.whatsappNumber = whatsappNumber.trim();
    }

    if (typeof birthday === 'string') {
      updateData.birthday = birthday;
    }

    if (typeof gender === 'string') {
      updateData.gender = gender;
    }

    if (typeof profileImage === 'string') {
      updateData.profileImage = profileImage;
    }

    const updated = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, user.id))
      .returning();

    if (!updated.length) {
      return res.status(404).json({
        error: 'User account not found.'
      });
    }

    const {
      passwordHash,
      ...safeUser
    } = updated[0];

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser
    });
  } catch (error) {
    console.error('Update profile error:', error);

    return res.status(500).json({
      error: 'Failed to update profile.'
    });
  }
});


/* =========================================================
   ADMIN UPDATE USER

   PUT /api/users/:id
========================================================= */

userRouter.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();

    const {
      fullName,
      email,
      matricNumber,
      phoneNumber,
      whatsappNumber,
      level,
      discipline,
      role,
      post,
      duesStatus,
      idCardStatus,
      attendance,
      resources,
      isAccountActive,
      profileImage
    } = req.body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (typeof fullName === 'string' && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    if (typeof email === 'string' && email.trim()) {
      updateData.email = email.trim().toLowerCase();
    }

    if (typeof matricNumber === 'string' && matricNumber.trim()) {
      updateData.matricNumber = matricNumber.trim().toUpperCase();
    }

    if (typeof phoneNumber === 'string') {
      updateData.phoneNumber = phoneNumber.trim();
    }

    if (typeof whatsappNumber === 'string') {
      updateData.whatsappNumber = whatsappNumber.trim();
    }

    if (typeof level === 'string') {
      updateData.level = level;
    }

    if (typeof discipline === 'string') {
      updateData.discipline = discipline;
    }

    if (typeof role === 'string') {
      updateData.role = role;
    }

    if (typeof post === 'string') {
      updateData.post = post;
    }

    if (typeof duesStatus === 'string') {
      updateData.duesStatus = duesStatus;
    }

    if (typeof idCardStatus === 'string') {
      updateData.idCardStatus = idCardStatus;
    }

    if (typeof attendance === 'number') {
      updateData.attendance = Math.max(0, Math.min(100, attendance));
    }

    if (typeof resources === 'number') {
      updateData.resources = Math.max(0, Math.min(100, resources));
    }

    if (typeof isAccountActive === 'boolean') {
      updateData.isAccountActive = isAccountActive;
    }

    if (typeof profileImage === 'string') {
      updateData.profileImage = profileImage;
    }

    const updated = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, req.params.id))
      .returning();

    if (!updated.length) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    const {
      passwordHash,
      ...safeUser
    } = updated[0];

    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: safeUser
    });
  } catch (error: any) {
    console.error('Admin update user error:', error);

    if (error?.code === '23505') {
      return res.status(400).json({
        error: 'Email or matric number is already in use.'
      });
    }

    return res.status(500).json({
      error: 'Failed to update user.'
    });
  }
});


/* =========================================================
   ACTIVATE USER

   PATCH /api/users/:id/activate
========================================================= */

userRouter.patch(
  '/:id/activate',
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();

      const updated = await db
        .update(schema.users)
        .set({
          isAccountActive: true,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, req.params.id))
        .returning();

      if (!updated.length) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      return res.json({
        success: true,
        message: 'User account activated successfully.'
      });
    } catch (error) {
      console.error('Activate user error:', error);

      return res.status(500).json({
        error: 'Failed to activate user.'
      });
    }
  }
);


/* =========================================================
   DEACTIVATE USER

   PATCH /api/users/:id/deactivate
========================================================= */

userRouter.patch(
  '/:id/deactivate',
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDb();

      const updated = await db
        .update(schema.users)
        .set({
          isAccountActive: false,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, req.params.id))
        .returning();

      if (!updated.length) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      return res.json({
        success: true,
        message: 'User account deactivated successfully.'
      });
    } catch (error) {
      console.error('Deactivate user error:', error);

      return res.status(500).json({
        error: 'User account deactivated successfully.'
      });
    }
  }
);


/* =========================================================
   DELETE USER
   ADMIN ONLY

   DELETE /api/users/:id
========================================================= */

userRouter.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDb();

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, req.params.id)
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    // Prevent an administrator from accidentally deleting
    // another administrator through the normal user-management route.
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Administrator accounts cannot be deleted from user management.'
      });
    }

    await db
      .delete(schema.users)
      .where(eq(schema.users.id, req.params.id));

    return res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);

    return res.status(500).json({
      error: 'Failed to delete user.'
    });
  }
});