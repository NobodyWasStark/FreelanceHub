import { Router } from 'express';
import { z } from 'zod';
import { submitProposal, getMyProposals, getJobProposals, acceptProposal, rejectProposal } from '../controllers/proposalController';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

const submitProposalSchema = z.object({
  body: z.object({
    jobId: z.string().uuid('Invalid job ID'),
    coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
    amount: z.number().positive('Amount must be positive'),
  }),
});

router.post('/', authenticate, requireRole('FREELANCER'), validate(submitProposalSchema), submitProposal);
router.get('/my', authenticate, requireRole('FREELANCER'), getMyProposals);
router.get('/job/:jobId', authenticate, requireRole('CLIENT'), getJobProposals);

router.put('/:id/accept', authenticate, requireRole('CLIENT'), acceptProposal);
router.put('/:id/reject', authenticate, requireRole('CLIENT'), rejectProposal);

export default router;
