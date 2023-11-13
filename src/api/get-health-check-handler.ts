import { Request, Response } from 'express';
import { logger } from 'base/logger';
import { Database } from '../base/postgres';

/**
 * @openapi
 * /health-check:
 *   get:
 *     summary: Get if service is ready to handle connections
 *     tags:
 *       - Checks
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: OK
 *       503:
 *         description: Not Ready for connections
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Not Ready for connections
 */

export const getHealthCheckHandler = (db: Database) =>
  async function handle(_: Request, res: Response) {
    try {
      const result = await db.query('SELECT NOW()');
      if (result) {
        return res.status(200).send('OK');
      }
      return res.status(503).send('Not Ready for connections');
    } catch (error) {
      logger.error({ message: 'Error connecting to DB while healthcheck', error });
      return res.status(503).send('Not Ready for connections');
    }
  };
