import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index'; // We will export `io` from index.ts

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user!.id;

    if (senderId === receiverId) {
      res.status(400).json({ error: 'Cannot send message to yourself' });
      return;
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      res.status(404).json({ error: 'Receiver not found' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    // Emit via socket if receiver is online
    io.to(receiverId).emit('newMessage', message);

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error sending message' });
  }
};

export const getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching conversation' });
  }
};

export const getConversationsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, role: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map();
    for (const msg of messages) {
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: msg
        });
      }
    }

    res.status(200).json({ conversations: Array.from(conversationMap.values()) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching conversations list' });
  }
};
