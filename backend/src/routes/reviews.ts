import { Router } from 'express';
import { z } from 'zod';
import { createReview, getUserReviews } from '../controllers/reviewController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

const createReviewSchema = z.object({
  body: z.object({
    revieweeId: z.string().uuid('Invalid reviewee ID'),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
  }),
});

router.post('/', authenticate, validate(createReviewSchema), createReview);
router.get('/:userId', getUserReviews);

export default router;
