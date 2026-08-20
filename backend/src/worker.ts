import { config, connectDatabase, disconnectDatabase, connectRedis, disconnectRedis } from './config/index.js';
import { logger } from './shared/utils/logger.js';
import { startEmailWorker, stopEmailWorker } from './infrastructure/email/email-queue.js';

async function bootstrapWorker() {
  try {
    logger.info('Starting email worker...');

    // Connect to database (needed for notification logging)
    await connectDatabase();
    logger.info('Database connection established');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connection established');

    // Start email worker
    startEmailWorker();
    logger.info('Email worker is running');

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down worker...`);

      try {
        await stopEmailWorker();
        await disconnectRedis();
        await disconnectDatabase();
        logger.info('Worker shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during worker shutdown', { error });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start worker', { error });
    process.exit(1);
  }
}

bootstrapWorker();
