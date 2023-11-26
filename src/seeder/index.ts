import { createDependencyContainer } from 'business';
import { Database } from 'base/postgres';
import { databaseConfig } from 'config/database';
import { logger } from 'base/logger';

async function runSeed() {
  try {
    logger.info('Running seed...');
    const db = new Database(databaseConfig);
    const { userService } = createDependencyContainer({ db });
    await userService.createUser('Test User 1', '1234567890');
    await userService.createUser('Test User 2', '1234567891');
    logger.info('Seed successful !');
  } catch (error) {
    logger.error(error);
  }
}

runSeed();
