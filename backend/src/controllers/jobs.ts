import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { prisma } from "../utils/prisma";

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, budget, skills } = req.body;
    const clientId = (req as any).user.id; // From authMiddleware

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        skills,
        clientId
      }
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};
