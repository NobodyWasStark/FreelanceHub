import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const submitProposal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { coverLetter, amount, jobId } = req.body;
  const freelancerId = req.user!.id; // FREELANCER only

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  if (job.status !== 'OPEN') {
    res.status(400).json({ error: 'Cannot submit proposal to a closed job' });
    return;
  }

  const existingProposal = await prisma.proposal.findFirst({
    where: { jobId, freelancerId }
  });

  if (existingProposal) {
    res.status(400).json({ error: 'You have already submitted a proposal for this job' });
    return;
  }

  const proposal = await prisma.proposal.create({
    data: { coverLetter, amount, jobId, freelancerId },
  });

  // Automatically start a conversation when a proposal is submitted
  let conversation = await prisma.conversation.findUnique({
    where: {
      freelancerId_clientId: { freelancerId, clientId: job.clientId }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { freelancerId, clientId: job.clientId }
    });
  }

  const messageContent = `I have submitted a proposal for "${job.title}".\n\n${coverLetter}`;

  const message = await prisma.message.create({
    data: {
      senderId: freelancerId,
      receiverId: job.clientId,
      conversationId: conversation.id,
      content: messageContent,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date(), lastMessagePreview: messageContent.substring(0, 50) }
  });

  io.to(job.clientId).emit('newMessage', message);

  res.status(201).json({ message: 'Proposal submitted successfully', proposal });
});

export const getMyProposals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const freelancerId = req.user!.id;
  const { page: pageQuery, limit: limitQuery } = req.query;

  const { page, limit } = paginationSchema.parse({ page: pageQuery, limit: limitQuery });
  const skip = (page - 1) * limit;

  const [proposals, total] = await prisma.$transaction([
    prisma.proposal.findMany({
      where: { freelancerId },
      skip,
      take: limit,
      include: {
        job: { 
          select: { 
            id: true, title: true, budget: true, status: true, clientId: true,
            client: { select: { name: true } }
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.proposal.count({ where: { freelancerId } }),
  ]);

  res.status(200).json({ 
    data: proposals,
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

export const getJobProposals = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;
  const clientId = req.user!.id; // CLIENT only
  const { page: pageQuery, limit: limitQuery } = req.query;

  const { page, limit } = paginationSchema.parse({ page: pageQuery, limit: limitQuery });
  const skip = (page - 1) * limit;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  if (job.clientId !== clientId) {
    res.status(403).json({ error: 'Forbidden - You can only view proposals for your own jobs' });
    return;
  }

  const [proposals, total] = await prisma.$transaction([
    prisma.proposal.findMany({
      where: { jobId },
      skip,
      take: limit,
      include: {
        freelancer: { select: { id: true, name: true, avatarUrl: true, skills: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.proposal.count({ where: { jobId } }),
  ]);

  res.status(200).json({ 
    data: proposals,
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

export const acceptProposal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user!.id; // CLIENT only

  const proposal = await prisma.proposal.findUnique({ 
    where: { id },
    include: { job: true } 
  });

  if (!proposal) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  if (proposal.job.clientId !== clientId) {
    res.status(403).json({ error: 'Forbidden - You can only accept proposals for your own jobs' });
    return;
  }

  // Transaction to update proposal and job
  await prisma.$transaction([
    prisma.proposal.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    }),
    prisma.job.update({
      where: { id: proposal.jobId },
      data: { status: 'IN_PROGRESS' }
    })
  ]);

  res.status(200).json({ message: 'Proposal accepted successfully' });
});

export const rejectProposal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user!.id;

  const proposal = await prisma.proposal.findUnique({ 
    where: { id },
    include: { job: true }
  });

  if (!proposal) {
    res.status(404).json({ error: 'Proposal not found' });
    return;
  }

  if (proposal.job.clientId !== clientId) {
    res.status(403).json({ error: 'Forbidden - You can only reject proposals for your own jobs' });
    return;
  }

  await prisma.proposal.update({
    where: { id },
    data: { status: 'REJECTED' }
  });

  res.status(200).json({ message: 'Proposal rejected successfully' });
});