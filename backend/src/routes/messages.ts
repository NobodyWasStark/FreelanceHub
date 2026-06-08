import { Router } from 'express';
import { z } from 'zod';
import { sendMessage, getConversation, getConversationsList } from '../controllers/messageController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid('Invalid receiver ID'),
    content: z.string().min(1, 'Message cannot be empty'),
  }),
});

router.post('/', authenticate, validate(sendMessageSchema), sendMessage);
router.get('/', authenticate, getConversationsList);
router.get('/:userId', authenticate, getConversation);

export default router;
