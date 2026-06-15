import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { receiverId, content } = req.body;
  const senderId = req.user!.id;
  const senderRole = req.user!.role; // Already decoded from JWT — no DB call needed

  if (senderId === receiverId) {
    res.status(400).json({ error: 'Cannot send message to yourself' });
    return;
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });

  if (!receiver) {
    res.status(404).json({ error: 'Receiver not found' });
    return;
  }

  let freelancerId: string, clientId: string;
  if (senderRole === 'FREELANCER') {
    freelancerId = senderId;
    clientId = receiverId;
  } else {
    freelancerId = receiverId;
    clientId = senderId;
  }

  let conversation = await prisma.conversation.findUnique({
    where: { freelancerId_clientId: { freelancerId, clientId } }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { freelancerId, clientId }
    });
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      conversationId: conversation.id,
      content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date(), lastMessagePreview: content.substring(0, 50) }
  });

  // Emit via socket if receiver is online, and also to sender's other tabs
  io.to(receiverId).emit('newMessage', message);
  io.to(senderId).emit('newMessage', message);

  res.status(201).json({ message: 'Message sent successfully', data: message });
});

export const getConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const currentUserId = req.user!.id;
  const { page: pageQuery, limit: limitQuery } = req.query;

  const { page, limit } = paginationSchema.parse({ page: pageQuery, limit: limitQuery });
  const skip = (page - 1) * limit;

  const [messages, total] = await prisma.$transaction([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      }
    }),
  ]);

  res.status(200).json({ 
    data: messages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  });
});

export const getConversationsList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!.id;
  const { page: pageQuery, limit: limitQuery } = req.query;

  const { page, limit } = paginationSchema.parse({ page: pageQuery, limit: limitQuery });
  const skip = (page - 1) * limit;

  const [conversations, total] = await prisma.$transaction([
    prisma.conversation.findMany({
      where: {
        OR: [
          { freelancerId: currentUserId },
          { clientId: currentUserId }
        ]
      },
      skip,
      take: limit,
      include: {
        freelancer: { select: { id: true, name: true, avatarUrl: true, role: true } },
        client: { select: { id: true, name: true, avatarUrl: true, role: true } }
      },
      orderBy: { lastMessageAt: 'desc' }
    }),
    prisma.conversation.count({
      where: {
        OR: [
          { freelancerId: currentUserId },
          { clientId: currentUserId }
        ]
      }
    })
  ]);

  const formattedConvos = conversations.map(c => {
    const otherUser = c.freelancerId === currentUserId ? c.client : c.freelancer;
    return {
      user: otherUser,
      lastMessage: { content: c.lastMessagePreview, createdAt: c.lastMessageAt }
    };
  });

  res.status(200).json({
    data: formattedConvos,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  });
});