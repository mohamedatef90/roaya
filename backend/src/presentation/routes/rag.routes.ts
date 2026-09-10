import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { ragController } from '../controllers/rag.controller.js';

const router = Router();

const chatRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'CHAT_RATE_LIMITED', message: 'Please wait a moment before asking another question.' },
  },
});

router.post('/chat', chatRateLimiter, ragController.chat.bind(ragController));

export default router;
