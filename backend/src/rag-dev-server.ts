import type { NextFunction, Request, Response, Router } from 'express';

// This lightweight entry point runs only the public Roaya assistant. It avoids
// requiring PostgreSQL and Redis while developing or demoing the local chatbot.
process.env.NODE_ENV ??= 'development';
process.env.LOG_FORMAT = 'dev';
process.env.DATABASE_URL ??= 'postgresql://unused:unused@127.0.0.1:5432/unused';
process.env.JWT_SECRET ??= 'local-rag-only-secret-change-before-production';
process.env.CORS_ORIGIN ??= 'http://localhost:4300';
// Fast mode is the local development default: retrieval stays grounded while
// answers are assembled directly from the corpus without waiting for an LLM.
// Set RAG_GENERATION_PROVIDER=ollama when deeper model-written answers are preferred.
process.env.RAG_GENERATION_PROVIDER ??= 'extractive';
process.env.RAG_ENABLE_CMS ??= 'false';
process.env.RAG_ENABLE_VECTOR_SEARCH ??= 'false';
process.env.OLLAMA_BASE_URL ??= 'http://127.0.0.1:11434';
process.env.OLLAMA_MODEL ??= 'qwen3.5:4b';

async function bootstrap(): Promise<void> {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const ragModule = await import('./presentation/routes/rag.routes.js');
  const importedDefault = ragModule.default as unknown;
  const ragRouter = (
    (importedDefault as { default?: Router }).default ?? importedDefault
  ) as Router;

  const app = express();
  app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  }));
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'roaya-local-assistant' });
  });
  app.use('/api/v1/rag', ragRouter);
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Local assistant request failed', error);
    res.status(500).json({
      success: false,
      error: { code: 'LOCAL_ASSISTANT_ERROR', message: 'The local Roaya assistant could not answer.' },
    });
  });

  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, () => {
    console.log(`Roaya local assistant listening on http://localhost:${port}`);
  });
}

void bootstrap();
