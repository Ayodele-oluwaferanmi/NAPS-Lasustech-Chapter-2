
import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { userRouter } from './server/userRoutes.ts';
import { createServer as createViteServer } from 'vite';

import { authRouter } from './server/authRoutes.ts';

const app = express();

const PORT = Number(process.env.PORT || 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =================================
   BASIC MIDDLEWARE
================================= */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

/* =================================
   HEALTH CHECK
================================= */

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'NAPS LASUSTECH backend is running.',
  });
});

/* =================================
   AUTH ROUTES
================================= */

app.use('/api/auth', authRouter);

/* =================================
   START SERVER
================================= */

async function startServer() {
  const vite = await createViteServer({
    root: __dirname,

    server: {
      middlewareMode: true,
    },

    appType: 'custom',
  });

  /*
   * Let Vite handle all frontend files.
   * This is what allows .tsx/.ts files to be
   * transformed correctly instead of being sent
   * to the browser as raw TypeScript.
   */
  app.use(vite.middlewares);

  /* =================================
     FRONTEND FALLBACK
  ================================= */

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;

      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      template = await vite.transformIndexHtml(
        url,
        template
      );

      res.status(200).set({
        'Content-Type': 'text/html',
      }).end(template);

    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  /* =================================
     ERROR HANDLER
  ================================= */

  app.use(
    (
      error: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(error);

      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  );

  /* =================================
     START EXPRESS
  ================================= */

  app.listen(PORT, () => {
    console.log(`
========================================
 NAPS LASUSTECH PORTAL
========================================
 Server: http://localhost:${PORT}
 API:    http://localhost:${PORT}/api
 Auth:   http://localhost:${PORT}/api/auth
========================================
`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
app.use('/api/users', userRouter);