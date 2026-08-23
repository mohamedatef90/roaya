import { Router } from 'express';
import { logoController } from '../controllers/logo.controller.js';

const router = Router();

// Public website logos. This separate namespace stays clear of reverse-proxy
// authentication rules for /admin/* and only exposes active records.
router.get('/logos', logoController.getPublicLogos.bind(logoController));

export default router;
