import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { revieweeId, rating, comment } = req.body;
    const reviewerId = req.user!.id;

    if (reviewerId === revieweeId) {
      res.status(400).json({ error: 'You cannot review yourself' });
      return;
    }

    // Usually you would also check if they had a completed job together, 
    // but we'll stick to basics for now as per requirements.

    const reviewee = await prisma.user.findUnique({ where: { id: revieweeId } });
    if (!reviewee) {
      res.status(404).json({ error: 'User to review not found' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId,
        revieweeId,
      },
    });

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error creating review' });
  }
};

export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

    res.status(200).json({ 
      reviews, 
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching reviews' });
  }
};
