import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, skills, budget } = req.body;
    const clientId = req.user!.id; // Authenticated and verified by requireRole('CLIENT')

    const job = await prisma.job.create({
      data: {
        title,
        description,
        skills,
        budget,
        clientId,
      },
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error creating job' });
  }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skills, minBudget, maxBudget, clientId } = req.query;

    const filters: any = {};
    
    // If querying for a specific client's jobs, allow seeing all statuses
    // Otherwise, restrict to only OPEN jobs for the public job board
    if (clientId) {
      filters.clientId = clientId as string;
    } else {
      filters.status = 'OPEN';
    }

    if (skills) {
      const skillsArray = (skills as string).split(',').map((s) => s.trim());
      filters.skills = { hasSome: skillsArray };
    }

    if (minBudget || maxBudget) {
      filters.budget = {};
      if (minBudget) filters.budget.gte = parseFloat(minBudget as string);
      if (maxBudget) filters.budget.lte = parseFloat(maxBudget as string);
    }

    const jobs = await prisma.job.findMany({
      where: filters,
      include: {
        client: {
          select: { id: true, name: true, avatarUrl: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching jobs' });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, avatarUrl: true },
        },
        proposals: {
          select: { id: true } // Just return count or basic info for public view. 
        }
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching job' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, skills, budget, status } = req.body;
    const clientId = req.user!.id;

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.clientId !== clientId) {
      res.status(403).json({ error: 'Forbidden - You can only update your own jobs' });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { title, description, skills, budget, status },
    });

    res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error updating job' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = req.user!.id;

    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.clientId !== clientId) {
      res.status(403).json({ error: 'Forbidden - You can only delete your own jobs' });
      return;
    }

    await prisma.job.delete({ where: { id } });

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error deleting job' });
  }
};
