import { DBUserRepository } from './user-repository';
import { UserAlreadyExistError, UserService } from './user-service';

jest.mock('./user-repository'); // SoundPlayer is now a mock constructor

describe('UserService', () => {
  // eslint-disable-next-line no-restricted-syntax
  const userRepository = new (<new () => DBUserRepository>(
    DBUserRepository
  ))() as jest.Mocked<DBUserRepository>;

  describe('createUser', () => {
    it('should throw error if user already exists', async () => {
      // Arrange
      const userService = new UserService(userRepository);
      userRepository.doesUserExist = jest.fn().mockResolvedValue(true);
      // Act
      const createUser = await userService.createUser('John Doe', '1234567890');
      // Assert
      await expect(createUser).rejects.toThrow(UserAlreadyExistError);
    });

    it('should create 6 users in db', async () => {
      // Arrange
      const userService = new UserService(userRepository);
      userRepository.doesUserExist = jest.fn().mockResolvedValue(false);
      userRepository.createUsers = jest.fn().mockResolvedValue([]);
      // Act
      await userService.createUser('John Doe', '1234567890');
      // Assert
      await expect(userRepository.createUsers).toHaveBeenCalledTimes(1);
    });
  });
});
