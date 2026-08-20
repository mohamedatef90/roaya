import app from './app.js';
import { config, connectDatabase, disconnectDatabase, connectRedis, disconnectRedis } from './config/index.js';
import { logger } from './shared/utils/logger.js';
import { startEmailWorker, stopEmailWorker } from './infrastructure/email/email-queue.js';
import { startAnalyticsCleanupScheduler, stopAnalyticsCleanupScheduler } from './infrastructure/cron/index.js';
import { setupAnalyticsWebSocket, stopBroadcast } from './infrastructure/websocket/analytics-ws.js';

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connection established');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connection established');

    // Start email worker
    startEmailWorker();
    logger.info('Email worker started');

    // Start analytics cleanup scheduler
    startAnalyticsCleanupScheduler();
    logger.info('Analytics cleanup scheduler started');

    // Start server
    const server = app.listen(config.app.port, () => {
      logger.info(`Server running on port ${config.app.port}`);
      logger.info(`Environment: ${config.app.env}`);
      logger.info(`API Version: ${config.app.apiVersion}`);
      logger.info(`Health check: http://localhost:${config.app.port}/api/${config.app.apiVersion}/health`);
    });

    // Setup WebSocket server for analytics
    setupAnalyticsWebSocket(server);
    logger.info('WebSocket server initialized for analytics');

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          stopBroadcast();
          stopAnalyticsCleanupScheduler();
          await stopEmailWorker();
          await disconnectRedis();
          await disconnectDatabase();
          logger.info('All connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server - Full error:', error);
    logger.error('Failed to start server', { error });
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap();
