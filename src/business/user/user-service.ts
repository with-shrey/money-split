import { AppError } from 'base/errors';
import { UserModel, toUserModel } from './user-model';
import { UserRepository } from './user-repository';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { env } from 'config/env';

export class UserAlreadyExistError extends AppError {
  constructor() {
    super('User already exists');
  }
}

export class AuthError extends AppError {
  constructor() {
    super('Unable to verify your identity');
  }
}

export class UserService {
  constructor(public userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  createUser = async (name: string, phone: string): Promise<UserModel[]> => {
    const exists = await this.userRepository.doesUserExist(phone);
    if (exists) {
      throw new UserAlreadyExistError();
    }
    const FAKE_USERS_PER_USER = 5;
    const users = [];
    const user = {
      name,
      phone,
    };
    for (let userIndex = 0; userIndex < FAKE_USERS_PER_USER; userIndex += 1) {
      users.push({
        phone: `${faker.number.int({ min: 1000000000, max: 9999999999 })}`,
        name: faker.person.fullName(),
      });
    }
    const userDTOs = await this.userRepository.createUsers(user, users);
    return userDTOs.map((userDto) => toUserModel(userDto));
  };

  createToken = async (phone: string): Promise<string> => {
    const userDTO = await this.userRepository.getUserIdAndGroupIdByPhone(phone);
    if (!userDTO) {
      throw new AuthError();
    }
    const token = await jwt.sign(
      { id: userDTO.id, groupId: userDTO.groupId },
      env.JWT_SECRET ?? '',
      {
        expiresIn: '4h',
      },
    );
    return Promise.resolve(token);
  };

  validateToken = async (token?: string): Promise<UserModel> => {
    if (!token || !token.includes('Bearer')) {
      throw new AuthError();
    }
    const jwtToken = token.replace('Bearer ', '');
    const payload: any = jwt.verify(jwtToken, env.JWT_SECRET ?? '');
    if (!payload || !payload.id) {
      throw new AuthError();
    }
    const user = await this.userRepository.getUserById(payload.id);
    if (!user) {
      throw new AuthError();
    }
    return user;
  };

  getUsersByGroupId = async (groupId: number): Promise<UserModel[]> => {
    const userDTOs = await this.userRepository.getUsersByGroupId(groupId);
    return userDTOs.map((userDto) => toUserModel(userDto));
  };
}
