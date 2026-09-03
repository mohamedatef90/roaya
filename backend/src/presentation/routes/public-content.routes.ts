import { Router } from 'express';
import { publicContentController } from '../controllers/public-content.controller.js';

const router = Router();

// Public content routes do NOT require authentication. Rate limiting comes from
// the app-level apiRateLimiter in app.ts; a second router.use(apiRateLimiter)
// here used the same limiter instance and counted every request twice
// (effective 50 per window). Removed in the 2026-09-02 AI-readiness reconciliation.

// Blog posts
router.get('/blog', publicContentController.getBlogPosts.bind(publicContentController));
router.get('/blog/:slug', publicContentController.getBlogPostBySlug.bind(publicContentController));

// Case studies
router.get('/case-studies', publicContentController.getCaseStudies.bind(publicContentController));
router.get('/case-studies/:slug', publicContentController.getCaseStudyBySlug.bind(publicContentController));

// Packages
router.get('/packages', publicContentController.getPackages.bind(publicContentController));

// Team members
router.get('/team', publicContentController.getTeamMembers.bind(publicContentController));

// Testimonials
router.get('/testimonials', publicContentController.getTestimonials.bind(publicContentController));

export default router;
