import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { prisma } from "../utils/prisma";

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { partnerId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: String(partnerId) },
          { senderId: String(partnerId), receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
