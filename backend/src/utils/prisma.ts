import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Only log queries in development; query logging in production wastes CPU + I/O
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Cache the client on global in all environments to prevent multiple instances
globalForPrisma.prisma = prisma;
