import { Router } from 'express';
import { publicContentController } from '../controllers/public-content.controller.js';
import { apiRateLimiter } from '../middleware/rate-limiter.js';

const router = Router();

// All public content routes are rate limited but do NOT require authentication
router.use(apiRateLimiter);

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
