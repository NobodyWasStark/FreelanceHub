import { Router } from 'express';
import { z } from 'zod';
import { getUserProfile, updateMe, getMyStats, getMyActivity } from '../controllers/userController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

const updateMeSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    skills: z.array(z.string()).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

// Specific /me/* routes must come before the /:id wildcard
router.get('/me/stats',    authenticate, getMyStats);
router.get('/me/activity', authenticate, getMyActivity);
router.put('/me',          authenticate, validate(updateMeSchema), updateMe);
router.get('/:id',         getUserProfile);

export default router;
