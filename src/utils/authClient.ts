import {
  safeGetItem as storageGetItem,
  safeSetItem as storageSetItem,
  safeRemoveItem as storageRemoveItem
} from './storage';

import {
  User as UserType,
  AcademicLevel,
  PhysicsDiscipline
} from '../types';

// TYPES

export interface RegisterPayload {
  fullName: string;
  matricNumber: string;
  email: string;
  password: string;
  level: AcademicLevel;
  discipline: PhysicsDiscipline;
  phoneNumber?: string;
}

export interface SetupAdminPayload {
  fullName: string;
  email: string;
  matricNumber?: string;
  password: string;
  setupSecret?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  message?: string;
  user?: UserType;
  token?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  fileUrl?: string;
  error?: string;
}

// SAFE STORAGE

let memoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    return (
      storageGetItem(key) ??
      sessionStorage.getItem(key) ??
      memoryStorage[key] ??
      null
    );
  } catch {
    return memoryStorage[key] ?? null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    storageSetItem(key, value);
  } catch {
    console.warn(
      `Failed to write to browser storage for ${key}. Using memory fallback.`
    );
  }

  memoryStorage[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    storageRemoveItem(key);
  } catch {
    // Ignore storage errors
  }

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore session storage errors
  }

  delete memoryStorage[key];
}

// AUTH TOKEN STROAGE

export function getStoredAuthToken(): string | null {
  return safeGetItem('naps_auth_token');
}

export function setStoredAuthToken(token: string): void {
  safeSetItem('naps_auth_token', token);
}

export function clearStoredAuthToken(): void {
  safeRemoveItem('naps_auth_token');
  safeRemoveItem('naps_auth_role');
  safeRemoveItem('naps_user');
}

// REQUEST HEADERS

function getHeaders(
  customHeaders: Record<string, string> = {}
): HeadersInit {
  const token = getStoredAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ADMIN STATUS CHECK

export async function apiCheckAdminStatus(): Promise<{
  hasAdmin: boolean;
}> {
  try {
    const res = await fetch('/api/auth/admin-status', {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) {
      return { hasAdmin: false };
    }

    const data = await res.json();

    return {
      hasAdmin: Boolean(data.hasAdmin)
    };
  } catch {
    return {
      hasAdmin: false
    };
  }
}

// LOGIN

export async function apiLogin(
  identifier: string,
  password: string,
  adminPin?: string
): Promise<{
  success: boolean;
  user?: UserType;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
        adminPin
      })
    });

    let data: AuthResponse;

    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        error: `Server returned an invalid response (Status ${res.status}).`
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Authentication failed.'
      };
    }

    if (data.token) {
      setStoredAuthToken(data.token);
    }

    if (data.user) {
      safeSetItem(
        'naps_auth_role',
        data.user.role || 'student'
      );

      safeSetItem(
        'naps_user',
        JSON.stringify(data.user)
      );
    }

    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (err) {
    console.error('Login error:', err);

    return {
      success: false,
      error: 'Network error connecting to security server.'
    };
  }
}

// STUDENT REGISTRATION

export async function apiRegister(
  payload: RegisterPayload
): Promise<{
  success: boolean;
  user?: UserType;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        fullName: payload.fullName.trim(),
        matricNumber: payload.matricNumber.trim().toUpperCase(),
        email: payload.email.trim().toLowerCase(),
        phoneNumber: payload.phoneNumber?.trim() || ''
      })
    });

    let data: AuthResponse;

    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        error: `Server returned an invalid response (Status ${res.status}).`
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Registration failed.'
      };
    }

    if (data.token) {
      setStoredAuthToken(data.token);
    }

    if (data.user) {
      safeSetItem(
        'naps_auth_role',
        data.user.role || 'student'
      );

      safeSetItem(
        'naps_user',
        JSON.stringify(data.user)
      );
    }

    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (err) {
    console.error('Registration error:', err);

    return {
      success: false,
      error: 'Network error connecting to registration server.'
    };
  }
}

// CURRENT USER

export async function apiGetMe(): Promise<{
  success: boolean;
  user?: UserType;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      clearStoredAuthToken();

      return {
        success: false,
        error:
          res.status === 401
            ? 'unauthorized'
            : 'server_error'
      };
    }

    const data = await res.json();

    if (data.user) {
      safeSetItem(
        'naps_user',
        JSON.stringify(data.user)
      );
    }

    return {
      success: true,
      user: data.user
    };
  } catch (err) {
    console.error('Get current user error:', err);

    return {
      success: false,
      error: 'network_error'
    };
  }
}

// VALIDATE SESSION

export async function apiValidateSession(): Promise<{
  valid: boolean;
  user?: UserType;
}> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      return {
        valid: false
      };
    }

    const data = await res.json();

    if (data.user) {
      safeSetItem(
        'naps_user',
        JSON.stringify(data.user)
      );
    }

    return {
      valid: true,
      user: data.user || data
    };
  } catch {
    return {
      valid: false
    };
  }
}

// LOGOUT

export async function apiLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include'
    });
  } catch (err) {
    console.warn('Logout request failed:', err);
  } finally {
    clearStoredAuthToken();
  }
}

// FORGOT PASSWORD
export async function apiForgotPassword(
  email: string
): Promise<{
  message: string;
  previewResetToken?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email.trim().toLowerCase()
      })
    });

    let data;

    try {
      data = await res.json();
    } catch {
      return {
        message: '',
        error: `Server returned an invalid response (Status ${res.status}).`
      };
    }

    if (!res.ok) {
      return {
        message: '',
        error: data.error || 'Request failed.'
      };
    }

    return data;
  } catch {
    return {
      message: '',
      error: 'Network error requesting password reset.'
    };
  }
}

// RESET PASSWORD

export async function apiResetPassword(
  token: string,
  newPassword: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        token: token.trim(),
        newPassword
      })
    });

    let data;

    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        error: `Server returned an invalid response (Status ${res.status}).`
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Password reset failed.'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch {
    return {
      success: false,
      error: 'Network error resetting password.'
    };
  }
}

// CHANGE PASSWORD

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    let data;

    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        error: `Server returned an invalid response (Status ${res.status}).`
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update password.'
      };
    }

    if (data.token) {
      setStoredAuthToken(data.token);
    }

    return {
      success: true,
      message: data.message
    };
  } catch {
    return {
      success: false,
      error: 'Network error updating password.'
    };
  }
}

// ADMIN SETUP

export async function apiSetupAdmin(
  payload: SetupAdminPayload
): Promise<{
  success: boolean;
  user?: UserType;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/setup-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        matricNumber:
          payload.matricNumber?.trim().toUpperCase() || '',
        phoneNumber:
          payload.phoneNumber?.trim() || ''
      })
    });

   const responseText = await res.text();

let data: any;

try {
  data = JSON.parse(responseText);
} catch (parseErr) {
  console.error('ADMIN SETUP RAW SERVER RESPONSE:', responseText);

  return {
    success: false,
    error: `Server returned an invalid response (Status ${res.status}). Check the browser console for the server response.`
  };
}
    if (!res.ok) {
      return {
        success: false,
        error:
          data.error ||
          'Failed to initialize administrator.'
      };
    }

    if (data.token) {
      setStoredAuthToken(data.token);
    }

    if (data.user) {
      safeSetItem(
        'naps_auth_role',
        data.user.role || 'admin'
      );

      safeSetItem(
        'naps_user',
        JSON.stringify(data.user)
      );
    }

    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (err: any) {
    console.error('Setup admin error:', err);

    return {
      success: false,
      error:
        err?.message ||
        'Network error provisioning administrator.'
    };
  }
}

// DOCUMENT UPLOAD

export async function apiUploadDocument(
  base64Data: string,
  originalFileName: string,
  uploadType:
    | 'pq_pdf'
    | 'executive_photo'
    | 'pq_image'
    | 'profile_photo'
    | 'academic_material'
    | string
): Promise<UploadResponse> {
  try {
    const res = await fetch('/api/upload/document', {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        base64Data,
        originalFileName,
        uploadType
      })
    });

    let data;

    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        fileName: '',
        originalName: '',
        mimeType: '',
        sizeBytes: 0,
        dataUrl: '',
        fileUrl: '',
        error: `Server returned an invalid response (Status ${res.status}).`
      };
    }

    if (!res.ok) {
      return {
        success: false,
        fileName: '',
        originalName: '',
        mimeType: '',
        sizeBytes: 0,
        dataUrl: '',
        fileUrl: '',
        error:
          data.error ||
          'Upload failed security verification.'
      };
    }

    if (data && data.dataUrl && !data.fileUrl) {
      data.fileUrl = data.dataUrl;
    }

    return data;
  } catch {
    return {
      success: false,
      fileName: '',
      originalName: '',
      mimeType: '',
      sizeBytes: 0,
      dataUrl: '',
      fileUrl: '',
      error:
        'Network error connecting to file upload service.'
    };
  }
}

//  BACKWARD-COMPATIBLE ALIASES

export const uploadFileViaApi = apiUploadDocument;

export const getStoredToken = getStoredAuthToken;

