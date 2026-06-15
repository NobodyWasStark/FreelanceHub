import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { prisma } from "../utils/prisma";

export const submitProposal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, coverLetter, bidAmount } = req.body;
    const freelancerId = (req as any).user.id;

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const proposal = await prisma.proposal.create({
      data: {
        coverLetter,
        amount: parseFloat(bidAmount),
        jobId,
        freelancerId
      }
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit proposal' });
  }
};

export const getProposalsForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;
    const clientId = (req as any).user.id; // Make sure the client asking is the owner

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.clientId !== clientId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const proposals = await prisma.proposal.findMany({
      where: { jobId },
      include: { freelancer: { select: { name: true, email: true } } }
    });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
};
