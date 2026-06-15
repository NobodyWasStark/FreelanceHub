import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/users/me/stats
 * Returns dashboard stats scoped strictly to the authenticated freelancer.
 */
export const getMyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const freelancerId = req.user.id;

    // Run all three aggregations in parallel — single round-trip to the DB
    const [proposalsSent, acceptedProposals, completedContracts] = await Promise.all([
      prisma.proposal.count({ where: { freelancerId } }),
      prisma.proposal.count({ where: { freelancerId, status: 'ACCEPTED' } }),
      prisma.proposal.findMany({
        where: {
          freelancerId,
          status: 'ACCEPTED',
          job: { status: 'COMPLETED' },
        },
        select: { amount: true },
      }),
    ]);

    const totalEarned = completedContracts.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      stats: {
        proposalsSent,
        activeContracts: acceptedProposals,
        totalEarned,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching stats' });
  }
};

/**
 * GET /api/users/me/activity
 * Returns the 5 most recent proposal events for the authenticated freelancer's activity feed.
 */
export const getMyActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const recentProposals = await prisma.proposal.findMany({
      where: { freelancerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        job: { select: { title: true, client: { select: { name: true } } } },
      },
    });

    const activity = recentProposals.map((p) => ({
      id: p.id,
      status: p.status,
      jobTitle: p.job.title,
      clientName: p.job.client.name,
      createdAt: p.createdAt,
    }));

    res.status(200).json({ activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching activity' });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { bio, skills, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        bio,
        skills,
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        skills: true,
        avatarUrl: true,
      },
    });

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error updating profile' });
  }
};
