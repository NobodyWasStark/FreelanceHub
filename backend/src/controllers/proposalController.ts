import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const submitProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
      data: {
        coverLetter,
        amount,
        jobId,
        freelancerId,
      },
    });

    res.status(201).json({ message: 'Proposal submitted successfully', proposal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error submitting proposal' });
  }
};

export const getMyProposals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const freelancerId = req.user!.id;

    const proposals = await prisma.proposal.findMany({
      where: { freelancerId },
      include: {
        job: { 
          select: { 
            id: true, 
            title: true, 
            budget: true, 
            status: true,
            clientId: true,
            client: { select: { name: true } }
          } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ proposals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching proposals' });
  }
};

export const getJobProposals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const clientId = req.user!.id; // CLIENT only

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.clientId !== clientId) {
      res.status(403).json({ error: 'Forbidden - You can only view proposals for your own jobs' });
      return;
    }

    const proposals = await prisma.proposal.findMany({
      where: { jobId },
      include: {
        freelancer: { select: { id: true, name: true, avatarUrl: true, skills: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ proposals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching job proposals' });
  }
};

export const acceptProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error accepting proposal' });
  }
};

export const rejectProposal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error rejecting proposal' });
  }
};
