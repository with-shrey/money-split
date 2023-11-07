import { NextFunction, Request, Response } from 'express';
import { DependencyContainer } from 'business';
import { UserModel } from 'business/user/user-model';

export type AuthReq<T> = T & {
  user?: UserModel;
};

export const authenticationMiddleware =
  ({ userService }: DependencyContainer) =>
  async (request: AuthReq<Request>, response: Response, next: NextFunction) => {
    try {
      const user = await userService.validateToken(request.headers.authorization);
      request.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
