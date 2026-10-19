
import { Router, Request, Response, NextFunction } from 'express';
import {
  hashPassword,
  isValidEmail,
  validatePasswordStrength,
  verifyPassword,
  sanitizeInput,
  generateSecureToken
} from './security.ts';

import { authService } from './services/authService.ts';

export interface AuthRequest extends Request {
  user?: any;
  session?: any;
}

export const authRouter = Router();

/* =========================================================
   HELPERS
========================================================= */

function sanitizeUserResponse(user: any) {
  if (!user) return null;

  const {
    password,
    passwordHash,
    ...safeUser
  } = user;

  return safeUser;
}

/**
 * Extract session token from either:
 * 1. HTTP-only cookie
 * 2. Authorization Bearer header
 */
export function extractSessionToken(
  req: Request
): string | null {

  if (req.cookies?.naps_session) {
    return req.cookies.naps_session;
  }

  const authHeader = req.headers.authorization;

  if (
    authHeader &&
    authHeader.startsWith('Bearer ')
  ) {
    return authHeader
      .substring(7)
      .trim();
  }

  return null;
}

/* =========================================================
   MATRIC NUMBER SECURITY
========================================================= */

/**
 * NAPS LASUSTECH matriculation rules.
 *
 * 2303050... = 400 Level
 * 2403050... = 300 Level
 * 2503050... = 200 Level
 * 2603050... = 100 Level
 *
 * The backend is the final authority for this validation.
 */

const MATRIC_RULES = [
  {
    prefix: '2303050',
    level: '400 Level'
  },
  {
    prefix: '2403050',
    level: '300 Level'
  },
  {
    prefix: '2503050',
    level: '200 Level'
  },
  {
    prefix: '2603050',
    level: '100 Level'
  }
] as const;

function validateMatricNumber(
  matricNumber: string
): {
  valid: boolean;
  level?: string;
  error?: string;
} {

  const matric = matricNumber
    .trim()
    .toUpperCase();

  if (!matric) {
    return {
      valid: false,
      error: 'Matric number is required.'
    };
  }

  /*
   * Current NAPS matric format begins with:
   * 23/24/25/26 + 03050
   *
   * We require at least the known 7-character prefix
   * plus additional matric characters.
   */
  const rule = MATRIC_RULES.find(
    item => matric.startsWith(item.prefix)
  );

  if (!rule) {
    return {
      valid: false,
      error:
        'Invalid LASUSTECH matric number. Please enter a valid NAPS matric number.'
    };
  }

  /*
   * Prevent spaces and unusual characters.
   */
  if (!/^[A-Z0-9]+$/.test(matric)) {
    return {
      valid: false,
      error:
        'Matric number can only contain letters and numbers.'
    };
  }

  /*
   * The prefix alone is not enough to be a complete
   * matric number.
   */
  if (matric.length <= rule.prefix.length) {
    return {
      valid: false,
      error:
        'Please enter your complete matric number.'
    };
  }

  return {
    valid: true,
    level: rule.level
  };
}

/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {

    const token = extractSessionToken(req);

    if (!token) {
      return res.status(401).json({
        error:
          'Authentication required. Please sign in.'
      });
    }

    const session =
      await authService.getSession(token);

    if (!session) {

      res.clearCookie('naps_session');

      return res.status(401).json({
        error:
          'Session expired or invalid. Please sign in again.'
      });
    }

    const user =
      await authService.findUserById(
        session.userId
      );

    if (
      !user ||
      !user.isAccountActive
    ) {

      await authService.invalidateSession(
        token
      );

      res.clearCookie('naps_session');

      return res.status(401).json({
        error:
          'User account is inactive or not found.'
      });
    }

    req.user = user;
    req.session = session;

    next();

  } catch (error) {

    console.error(
      'Authentication middleware error:',
      error
    );

    return res.status(500).json({
      error:
        'Authentication error.'
    });
  }
}

/* =========================================================
   ADMIN MIDDLEWARE
========================================================= */

export async function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  await requireAuth(
    req,
    res,
    () => {

      const user = req.user;

      if (
        !user ||
        user.role !== 'admin'
      ) {

        return res.status(403).json({
          error:
            'Access denied. Administrator privileges required.'
        });
      }

      next();
    }
  );
}

/* =========================================================
   ADMIN STATUS
========================================================= */

authRouter.get(
  '/admin-status',
  async (
    _req: Request,
    res: Response
  ) => {

    try {

      const hasAdmin =
        await authService.hasAnyAdmin();

      return res.json({
        hasAdmin
      });

    } catch (error) {

      console.error(
        'Admin status error:',
        error
      );

      return res.status(500).json({
        error:
          'Failed to get administrator status.'
      });
    }
  }
);

/* =========================================================
   STUDENT REGISTRATION
========================================================= */

authRouter.post(
  '/register',
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const {
        fullName,
        matricNumber,
        email,
        password,
        discipline,
        phoneNumber
      } = req.body;

      /* ---------------------------------------------
         BASIC INPUT CLEANING
      --------------------------------------------- */

      const cleanName =
        sanitizeInput(fullName || '');

      const cleanEmail =
        sanitizeInput(email || '')
          .toLowerCase()
          .trim();

      const cleanMatric =
        sanitizeInput(matricNumber || '')
          .toUpperCase()
          .trim();

      /* ---------------------------------------------
         NAME VALIDATION
      --------------------------------------------- */

      if (
        !cleanName ||
        cleanName.length < 3
      ) {

        return res.status(400).json({
          error:
            'Full Name is required.'
        });
      }

      /* ---------------------------------------------
         EMAIL VALIDATION
      --------------------------------------------- */

      if (
        !cleanEmail ||
        !isValidEmail(cleanEmail)
      ) {

        return res.status(400).json({
          error:
            'Valid email address is required.'
        });
      }

      /* ---------------------------------------------
         MATRIC VALIDATION
      --------------------------------------------- */

      const matricValidation =
        validateMatricNumber(
          cleanMatric
        );

      if (!matricValidation.valid) {

        return res.status(400).json({
          error:
            matricValidation.error
        });
      }

      /*
       * The server determines the academic level.
       * We do NOT trust the level sent by the browser.
       */
      const determinedLevel =
        matricValidation.level!;

      /* ---------------------------------------------
         PASSWORD VALIDATION
      --------------------------------------------- */

      const strength =
        validatePasswordStrength(
          password
        );

      if (!strength.isValid) {

        return res.status(400).json({
          error:
            strength.message
        });
      }

      /* ---------------------------------------------
         DUPLICATE CHECK
      --------------------------------------------- */

      const existingEmail =
        await authService.findUserByEmailOrMatric(
          cleanEmail
        );

      if (existingEmail) {

        return res.status(400).json({
          error:
            'An account with that email already exists.'
        });
      }

      const existingMatric =
        await authService.findUserByEmailOrMatric(
          cleanMatric
        );

      if (existingMatric) {

        return res.status(400).json({
          error:
            'An account with that matric number already exists.'
        });
      }

      /* ---------------------------------------------
         PASSWORD HASHING
      --------------------------------------------- */

      const passwordHash =
        JSON.stringify(
          hashPassword(password)
        );

      /* ---------------------------------------------
         CREATE USER
      --------------------------------------------- */

      const now =
        new Date();

      const userId =
        `user-${Date.now()}`;

      const newUser = {

        id: userId,

        fullName: cleanName,

        matricNumber: cleanMatric,

        email: cleanEmail,

        phoneNumber:
          sanitizeInput(
            phoneNumber || ''
          ),

        level: determinedLevel,

        discipline:
          sanitizeInput(
            discipline || 'Physics'
          ),

        role: 'student',

        post: null,

        duesStatus: 'Pending',

        idCardStatus:
          'Not Registered',

        attendance: 0,

        resources: 0,

        passwordHash,

        isAccountActive: true

      };

      await authService.saveUser(
        newUser
      );

      /* ---------------------------------------------
         CREATE SESSION
      --------------------------------------------- */

      const ip =
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';

      const userAgent =
        req.headers['user-agent'] ||
        'unknown';

      const token =
        generateSecureToken(32);

      await authService.createSession(
        newUser.id,
        newUser.role,
        token,
        ip,
        userAgent
      );

      /* ---------------------------------------------
         SESSION COOKIE
      --------------------------------------------- */

      res.cookie(
        'naps_session',
        token,
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            'production',

          sameSite: 'lax',

          maxAge:
            24 * 60 * 60 * 1000
        }
      );

      /* ---------------------------------------------
         RESPONSE
      --------------------------------------------- */

      return res.status(201).json({

        message:
          'Account created successfully!',

        user:
          sanitizeUserResponse(
            newUser
          ),

        token

      });

    } catch (error) {

      console.error(
        'Registration error:',
        error
      );

      return res.status(500).json({
        error:
          'Registration failed. Please try again.'
      });
    }
  }
);

/* =========================================================
   LOGIN
========================================================= */

authRouter.post(
  '/login',
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const {
        identifier,
        password
      } = req.body;

      if (
        !identifier ||
        !password
      ) {

        return res.status(400).json({
          error:
            'Matric number/email and password are required.'
        });
      }

      const cleanIdentifier =
        identifier
          .trim()
          .toLowerCase();

      const user =
        await authService
          .findUserByEmailOrMatric(
            cleanIdentifier
          );

      if (!user) {

        return res.status(401).json({
          error:
            'Invalid credentials or account does not exist.'
        });
      }

      if (
        !user.isAccountActive
      ) {

        return res.status(403).json({
          error:
            'This account has been deactivated.'
        });
      }

     
      
      /* ---------------------------------------------
         PASSWORD VERIFICATION
      --------------------------------------------- */

      let passwordValid = false;

      if (user.passwordHash) {
        try {
          let storedPassword: unknown = user.passwordHash;

          if (typeof user.passwordHash === 'string') {
            try {
              const parsed = JSON.parse(user.passwordHash);

              if (typeof parsed === 'string') {
                storedPassword = parsed;
              }
            } catch {
              // The saved value may already be salt:hash.
            }
          }

          if (typeof storedPassword === 'string') {
            passwordValid = verifyPassword(
              password,
              storedPassword
            );
          }
        } catch (error) {
          console.error(
            'Password verification error:',
            error
          );
        }
      }

      if (!passwordValid) {
        return res.status(401).json({
          error: 'Invalid credentials.'
        });
      }

      /* ---------------------------------------------
         UPDATE LAST LOGIN
      --------------------------------------------- */

      await authService.updateLoginState(
        user.id
      );

      /* ---------------------------------------------
         CREATE SESSION
      --------------------------------------------- */

      const ip =
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';

      const userAgent =
        req.headers['user-agent'] ||
        'unknown';

      const token =
        generateSecureToken(32);

      await authService.createSession(
        user.id,
        user.role,
        token,
        ip,
        userAgent
      );

      /* ---------------------------------------------
         COOKIE
      --------------------------------------------- */

      res.cookie(
        'naps_session',
        token,
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            'production',

          sameSite: 'lax',

          maxAge:
            24 * 60 * 60 * 1000
        }
      );

      return res.json({

        message:
          'Authentication successful.',

        user:
          sanitizeUserResponse(
            user
          ),

        token

      });

    } catch (error) {

      console.error(
        'Login error:',
        error
      );

      return res.status(500).json({
        error:
          'Login failed. Please try again.'
      });
    }
  }
);

/* =========================================================
   CURRENT USER
========================================================= */

authRouter.get(
  '/me',
  requireAuth,
  async (
    req: AuthRequest,
    res: Response
  ) => {

    return res.json({

      user:
        sanitizeUserResponse(
          req.user
        ),

      authenticated: true

    });
  }
);

/* =========================================================
   LOGOUT
========================================================= */

authRouter.post(
  '/logout',
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const token =
        extractSessionToken(req);

      if (token) {

        await authService
          .invalidateSession(
            token
          );
      }

      res.clearCookie(
        'naps_session'
      );

      return res.json({
        message:
          'Logged out successfully.'
      });

    } catch (error) {

      console.error(
        'Logout error:',
        error
      );

      return res.status(500).json({
        error:
          'Logout failed.'
      });
    }
  }
);

/* =========================================================
   FORGOT PASSWORD
========================================================= */

authRouter.post(
  '/forgot-password',
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const {
        email
      } = req.body;

      const genericResponse = {

        message:
          'If an account matches that email address, password reset instructions have been issued.'

      };

      if (
        !email ||
        !isValidEmail(email)
      ) {

        return res.json(
          genericResponse
        );
      }

      const user =
        await authService
          .findUserByEmailOrMatric(
            email
              .trim()
              .toLowerCase()
          );

      if (
        !user ||
        !user.isAccountActive
      ) {

        return res.json(
          genericResponse
        );
      }

      const rawToken =
        generateSecureToken(16);

      await authService
        .createPasswordResetToken(
          user.id,
          rawToken,
          15
        );

      /*
       * Development-only preview token.
       * In production this should be sent
       * through a proper email service.
       */

      return res.json({

        ...genericResponse,

        previewResetToken:
          process.env.NODE_ENV ===
          'development'
            ? rawToken
            : undefined

      });

    } catch (error) {

      console.error(
        'Forgot password error:',
        error
      );

      return res.status(500).json({
        error:
          'Forgot password request failed.'
      });
    }
  }
);

/* =========================================================
   RESET PASSWORD
========================================================= */

authRouter.post(
  '/reset-password',
  async (
    req: AuthRequest,
    res: Response
  ) => {

    try {

      const {
        token,
        newPassword
      } = req.body;

      if (
        !token ||
        typeof token !== 'string'
      ) {

        return res.status(400).json({
          error:
            'Password reset token is required.'
        });
      }

      const verification =
        await authService
          .verifyResetToken(
            token.trim()
          );

      if (
        !verification.valid ||
        !verification.userId
      ) {

        return res.status(400).json({
          error:
            'Invalid, expired, or previously used password reset token.'
        });
      }

      const strength =
        validatePasswordStrength(
          newPassword
        );

      if (!strength.isValid) {

        return res.status(400).json({
          error:
            strength.message
        });
      }

      const user =
        await authService
          .findUserById(
            verification.userId
          );

      if (!user) {

        return res.status(400).json({
          error:
            'User account not found.'
        });
      }

      user.passwordHash =
        JSON.stringify(
          hashPassword(
            newPassword
          )
        );

      await authService.saveUser(
        user
      );

      await authService
        .consumeResetToken(
          token.trim()
        );

      await authService
        .invalidateAllUserSessions(
          user.id
        );

      res.clearCookie(
        'naps_session'
      );

      return res.json({

        message:
          'Password reset successful! You may now sign in with your new password.'

      });

    } catch (error) {

      console.error(
        'Reset password error:',
        error
      );

      return res.status(500).json({
        error:
          'Reset password failed.'
      });
    }
  }
);


/* =========================================================
   LOGIN
========================================================= */

authRouter.post(
  '/login',
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const { identifier, password } = req.body;

      if (
        !identifier ||
        !password ||
        typeof identifier !== 'string' ||
        typeof password !== 'string'
      ) {
        return res.status(400).json({
          error:
            'Matric number/email and password are required.'
        });
      }

      const cleanIdentifier = identifier
        .trim()
        .toLowerCase();

      const user =
        await authService.findUserByEmailOrMatric(
          cleanIdentifier
        );

      if (!user) {
        return res.status(401).json({
          error:
            'Invalid credentials or account does not exist.'
        });
      }

      if (!user.isAccountActive) {
        return res.status(403).json({
          error:
            'This account has been deactivated.'
        });
      }

      /* ---------------------------------------------
         PASSWORD VERIFICATION
      --------------------------------------------- */

      let passwordValid = false;

      if (user.passwordHash) {
        try {
          const storedPassword =
            typeof user.passwordHash === 'string'
              ? JSON.parse(user.passwordHash)
              : user.passwordHash;

          passwordValid = verifyPassword(
            password,
            storedPassword.salt,
            storedPassword.hash,
            storedPassword.iterations
          );
        } catch (error) {
          console.error(
            'Password verification error:',
            error
          );

          passwordValid = false;
        }
      }

      if (!passwordValid) {
        return res.status(401).json({
          error: 'Invalid credentials.'
        });
      }

      /* ---------------------------------------------
         UPDATE LAST LOGIN
      --------------------------------------------- */

      await authService.updateLoginState(
        user.id
      );

      /* ---------------------------------------------
         CREATE SESSION
      --------------------------------------------- */

      const ip =
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';

      const userAgent =
        req.headers['user-agent'] ||
        'unknown';

      const token =
        generateSecureToken(32);

      await authService.createSession(
        user.id,
        user.role,
        token,
        ip,
        userAgent
      );

      /* ---------------------------------------------
         SESSION COOKIE
      --------------------------------------------- */

      res.cookie(
        'naps_session',
        token,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000
        }
      );

      /* ---------------------------------------------
         RESPONSE
      --------------------------------------------- */

      return res.json({
        message: 'Authentication successful.',
        user: sanitizeUserResponse(user),
        token
      });

    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      return res.status(500).json({
        error:
          'Login failed. Please try again.'
      });
    }
  }
);