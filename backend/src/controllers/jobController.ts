import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, skills, budget } = req.body;
  const clientId = req.user!.id; // Authenticated and verified by requireRole('CLIENT')

  const job = await prisma.job.create({
    data: { title, description, skills, budget, clientId },
  });

  res.status(201).json({ message: 'Job created successfully', job });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const { skills, minBudget, maxBudget, clientId, page: pageQuery, limit: limitQuery } = req.query;

  const { page, limit } = paginationSchema.parse({ page: pageQuery, limit: limitQuery });
  const skip = (page - 1) * limit;

  const filters: any = {};
  
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

  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where: filters,
      skip,
      take: limit,
      include: {
        client: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { proposals: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.job.count({ where: filters }),
  ]);

  res.status(200).json({
    data: jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      proposals: { select: { id: true } }
    },
  });

  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.status(200).json({ job });
});

export const updateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});

export const deleteJob = asyncHandler(async (req: AuthRequest, res: Response) => {
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
});