import express from 'express';
import { logger } from 'base/logger';
import { apiErrorMiddleware } from 'base/middleware/error-middleware';
import { notFoundMiddleware } from 'base/middleware/not-found-middleware';
import { requestLoggerMiddleware } from 'base/middleware/logger-middleware';
import getApiRouter from 'api/routes';

import openapiSpecification from './base/openapi/generate';
import swaggerUi from 'swagger-ui-express';
import { Database } from 'base/postgres';
import { databaseConfig } from './config/database';
import { createDependencyContainer } from './business';
import cors from 'cors';
import { getHealthCheckHandler } from 'api/get-health-check-handler';

type ServerConfig = {
  port: number;
  isTestEnv?: boolean;
};

export function createApp(db: Database) {
  const container = createDependencyContainer({ db });
  const app = express();
  app.use(cors());
  app.get('/api-docs/openapi.json', (_, res) => res.json(openapiSpecification));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

  app.use(requestLoggerMiddleware);
  app.use(express.json({ limit: '500kb' }));

  app.get('/health-check', getHealthCheckHandler(db));

  app.use('/api', getApiRouter(container));

  app.use(notFoundMiddleware);
  app.use(apiErrorMiddleware);
  return app;
}

async function startServer(config: ServerConfig) {
  const db = new Database(databaseConfig);
  const app = createApp(db);
  const server = app.listen(config.port, () => {
    logger.info({ message: `Server started on port ${config.port}` });
  });
  if (!config.isTestEnv) {
    function gracefulShutdown(code = 0) {
      logger.info({ message: 'Received signal to shut down gracefully.' });
      server.close(async () => {
        logger.info({ message: 'Server has been gracefully closed.' });
        await db
          .close()
          .catch((error) => logger.error({ message: 'Error closing DB pool', error }));
        logger.info({ message: 'Database pool is closed' });
        process.exit(code);
      });

      // TODO: close DB connection
    }

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGQUIT', gracefulShutdown);

    process.on('unhandledRejection', (error) => {
      logger.error({ message: 'unhandledRejection', error });
      gracefulShutdown(1);
    });

    process.on('uncaughtException', (error) => {
      logger.error({
        message: 'Fatal exception server is no more :-(',
        error,
      });
      gracefulShutdown(1);
    });
  }
}

if (require.main === module) {
  startServer({ port: 3000 }).catch((error) => {
    logger.error({
      message: 'Error starting app',
      error,
    });
    process.exit(1);
  });
}
