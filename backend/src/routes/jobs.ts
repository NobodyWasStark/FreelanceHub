import { Router } from 'express';
import { z } from 'zod';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    budget: z.coerce.number().positive('Budget must be a positive number'),
  }),
});

const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(20).optional(),
    skills: z.array(z.string()).min(1).optional(),
    budget: z.number().positive().optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

router.get('/', getJobs);
router.get('/:id', getJobById);

router.post('/', authenticate, requireRole('CLIENT'), validate(createJobSchema), createJob);
router.put('/:id', authenticate, requireRole('CLIENT'), validate(updateJobSchema), updateJob);
router.delete('/:id', authenticate, requireRole('CLIENT'), deleteJob);

export default router;
