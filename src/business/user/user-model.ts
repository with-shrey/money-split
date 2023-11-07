import { UserDTO } from './user-repository';

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       description: Product model
 *       required:
 *         - id
 *         - name
 *         - phone
 *       properties:
 *         phone:
 *           type: string
 *           description: phone of user
 *         name:
 *           type: string
 *           description: Full name of User
 *           maxLength: 50
 *         id:
 *           type: number
 */

export type UserModel = {
  id?: string;
  phone: string;
  name: string;
};

// other user operation on user model

export function toUserModel(userDTO: UserDTO): UserModel {
  return {
    id: userDTO.id,
    phone: userDTO.phone,
    name: userDTO.name,
  };
}
