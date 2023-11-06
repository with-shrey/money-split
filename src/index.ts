import express from 'express';
import { logger } from 'base/logger';
import { apiErrorMiddleware } from 'base/middleware/error-middleware';
import { notFoundMiddleware } from 'base/middleware/not-found-middleware';
import { requestLoggerMiddleware } from 'base/middleware/logger-middleware';
import apiRouter from 'api/routes';

import openapiSpecification from './base/openapi/generate';
// eslint-disable-next-line import/no-extraneous-dependencies
import swaggerUi from 'swagger-ui-express';

type ServerConfig = {
  port: number;
  isTestEnv?: boolean;
};

export function createApp() {
  const app = express();
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

  app.use(requestLoggerMiddleware);
  app.use(express.json({ limit: '500kb' }));

  app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK');
  });

  app.use('/api', apiRouter);

  app.use(notFoundMiddleware);
  app.use(apiErrorMiddleware);
  return app;
}

async function startServer(app: express.Application, config: ServerConfig) {
  const server = app.listen(config.port, () => {
    logger.info({ message: `Server started on port ${config.port}` });
  });

  if (!config.isTestEnv) {
    function gracefulShutdown(code = 0) {
      logger.info({ message: 'Received signal to shut down gracefully.' });
      server.close(() => {
        logger.info({ message: 'Server has been gracefully closed.' });
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
  startServer(createApp(), { port: 3000 }).catch((error) => {
    logger.error({
      message: 'Error starting app',
      error,
    });
    process.exit(1);
  });
}
