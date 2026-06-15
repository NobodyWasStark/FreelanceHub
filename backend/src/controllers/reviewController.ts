import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { revieweeId, rating, comment } = req.body;
  const reviewerId = req.user!.id;

  if (reviewerId === revieweeId) {
    res.status(400).json({ error: 'You cannot review yourself' });
    return;
  }

  const reviewee = await prisma.user.findUnique({ where: { id: revieweeId } });
  if (!reviewee) {
    res.status(404).json({ error: 'User to review not found' });
    return;
  }

  const review = await prisma.review.create({
    data: { rating, comment, reviewerId, revieweeId },
  });

  res.status(201).json({ message: 'Review created successfully', review });
});

export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page: pageQuery, limit: limitQuery } = req.query;

  const { page, limit } = paginationSchema.parse({ page: pageQuery, limit: limitQuery });
  const skip = (page - 1) * limit;

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { revieweeId: userId },
      skip,
      take: limit,
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count({ where: { revieweeId: userId } }),
  ]);

  const allReviews = await prisma.review.findMany({ where: { revieweeId: userId }, select: { rating: true } });
  const averageRating = allReviews.length > 0
    ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
    : 0;

  res.status(200).json({ 
    data: reviews, 
    averageRating: parseFloat(averageRating.toFixed(1)),
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