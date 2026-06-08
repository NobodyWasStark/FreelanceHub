import { Router } from 'express';
import { z } from 'zod';
import { getUserProfile, updateMe } from '../controllers/userController';
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

router.get('/:id', getUserProfile);
router.put('/me', authenticate, validate(updateMeSchema), updateMe);

export default router;
