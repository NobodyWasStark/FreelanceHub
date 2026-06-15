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
// No role guard here — ownership is enforced in the controller (job.clientId === req.user.id).
// A user whose DB role is FREELANCER may still have posted jobs as a client.
router.get('/job/:jobId', authenticate, getJobProposals);

router.put('/:id/accept', authenticate, acceptProposal);
router.put('/:id/reject', authenticate, rejectProposal);

export default router;
