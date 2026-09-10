import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { ragService } from '../../application/services/rag.service.js';

const ragRequestSchema = z.object({
  question: z.string().trim().min(2).max(800),
  language: z.enum(['ar', 'en']).default('ar'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(1200),
  })).max(8).default([]),
});

export class RagController {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = ragRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CHAT_REQUEST',
            message: 'Please provide a valid question and language.',
          },
        });
        return;
      }
      const input = parsed.data;
      const result = await ragService.answer(input.question, input.language, input.history);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const ragController = new RagController();
