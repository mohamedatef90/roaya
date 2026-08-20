import { PrismaClient } from '@prisma/client';
import { config } from './environment.js';
import { logger } from '../shared/utils/logger.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientOptions = {
  log: config.app.isDevelopment
    ? [
        { emit: 'event' as const, level: 'query' as const },
        { emit: 'stdout' as const, level: 'error' as const },
        { emit: 'stdout' as const, level: 'warn' as const },
      ]
    : [{ emit: 'stdout' as const, level: 'error' as const }],
};

export const prisma = global.prisma ?? new PrismaClient(prismaClientOptions);

if (config.app.isDevelopment) {
  global.prisma = prisma;
  
  prisma.$on('query' as never, (e: { query: string; params: string; duration: number }) => {
    logger.debug('Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
