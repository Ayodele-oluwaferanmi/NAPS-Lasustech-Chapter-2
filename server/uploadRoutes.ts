import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { requireAuth, requireAdmin } from './authRoutes.ts';
import { sanitizeFilename } from './security.ts';

export interface AuthRequest extends Request {
  user?: any;
  session?: any;
}

export const uploadRouter = Router();

// Allowed MIME signatures (Magic Bytes)
const MAGIC_BYTES = {
  pdf: [
    [0x25, 0x50, 0x44, 0x46]
  ],
  jpeg: [
    [0xFF, 0xD8, 0xFF]
  ],
  png: [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  ],
  webp: [
    [0x52, 0x49, 0x46, 0x46] // WEBP starts with RIFF ... WEBP, basic check
  ]
};

function checkMagicBytes(buffer: Buffer, signatures: number[][]): boolean {
  for (const sig of signatures) {
    if (buffer.length < sig.length) continue;
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

function detectFileType(buffer: Buffer): { isValid: boolean; detectedMime: string } {
  if (checkMagicBytes(buffer, MAGIC_BYTES.pdf)) return { isValid: true, detectedMime: 'application/pdf' };
  if (checkMagicBytes(buffer, MAGIC_BYTES.jpeg)) return { isValid: true, detectedMime: 'image/jpeg' };
  if (checkMagicBytes(buffer, MAGIC_BYTES.png)) return { isValid: true, detectedMime: 'image/png' };
  if (checkMagicBytes(buffer, MAGIC_BYTES.webp)) return { isValid: true, detectedMime: 'image/webp' };
  
  return { isValid: false, detectedMime: 'application/octet-stream' };
}

uploadRouter.post('/document', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { file, originalName } = req.body;
    const user = req.user;

    if (!file || !originalName) {
      return res.status(400).json({ error: 'File data and originalName are required.' });
    }

    if (user.role !== 'admin' && user.role !== 'executive') {
      return res.status(403).json({ error: 'Only administrators and executives can upload official documents.' });
    }

    let buffer: Buffer;
    let mimeType = '';
    
    if (file.startsWith('data:')) {
      const parts = file.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      buffer = Buffer.from(parts[1] || '', 'base64');
    } else {
      buffer = Buffer.from(file, 'base64');
    }

    const MAX_DOC_SIZE = 15 * 1024 * 1024;
    if (buffer.length > MAX_DOC_SIZE) {
      return res.status(413).json({ error: 'Document exceeds 15MB size limit.' });
    }

    const inspection = detectFileType(buffer);
    if (!inspection.isValid || inspection.detectedMime !== 'application/pdf') {
      return res.status(415).json({ error: 'Invalid document format. Only verified PDF files are permitted.' });
    }

    const sanitizedOriginal = sanitizeFilename(originalName);
    const safeUUID = crypto.randomUUID().split('-')[0];
    const safeExt = 'pdf';
    
    const safeStoredName = `naps_${Date.now()}_${safeUUID}.${safeExt}`;
    const verifiedDataUrl = `data:${inspection.detectedMime};base64,${buffer.toString('base64')}`;

    res.status(201).json({
      message: 'Document securely processed.',
      fileName: safeStoredName,
      originalName: sanitizedOriginal,
      mimeType: inspection.detectedMime,
      sizeBytes: buffer.length,
      dataUrl: verifiedDataUrl
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'File processing error. Please check the file and try again.' });
  }
});

uploadRouter.post('/image', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { image, originalName, context } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let buffer: Buffer;
    let mimeType = '';
    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      buffer = Buffer.from(parts[1] || '', 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const MAX_IMG_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_IMG_SIZE) {
      return res.status(413).json({ error: 'Image exceeds 5MB size limit.' });
    }

    const inspection = detectFileType(buffer);
    if (!inspection.isValid || !inspection.detectedMime.startsWith('image/')) {
      return res.status(415).json({ error: 'Invalid image format. Must be JPEG, PNG, or WEBP.' });
    }

    let prefix = 'img';
    if (context === 'profile') prefix = 'avatar';
    if (context === 'gallery') prefix = 'gallery';
    if (context === 'event') prefix = 'event';

    const safeUUID = crypto.randomUUID().split('-')[0];
    const ext = inspection.detectedMime.split('/')[1] || 'jpg';
    
    const safeStoredName = `${prefix}_${Date.now()}_${safeUUID}.${ext}`;
    const sanitizedOriginal = originalName ? sanitizeFilename(originalName) : safeStoredName;
    const verifiedDataUrl = `data:${inspection.detectedMime};base64,${buffer.toString('base64')}`;

    res.status(201).json({
      message: 'Image securely processed.',
      fileName: safeStoredName,
      originalName: sanitizedOriginal,
      mimeType: inspection.detectedMime,
      sizeBytes: buffer.length,
      dataUrl: verifiedDataUrl
    });

  } catch (err: unknown) {
    return res.status(500).json({ error: 'Image processing error. Please try again.' });
  }
});
