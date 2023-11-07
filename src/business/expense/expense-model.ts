import { ExpenseDTO } from './expense-repository';

/**
 * @openapi
 * components:
 *   schemas:
 *     Expense:
 *       description: Product model
 *       required:
 *         - id
 *         - name
 *         - amount
 *         - splitType
 *       properties:
 *         amount:
 *           type: number
 *           description: amount
 *         name:
 *           type: string
 *           description: Full name of User
 *           maxLength: 50
 *         id:
 *           type: number
 *         paidBy:
 *           type: number
 *         split_type:
 *          type: string
 *          enum: [equal, percentage]
 */

export type ExpenseModel = {
  id?: number;
  amount: number;
  name: string;
  splitType: 'equal' | 'percentage';
  groupId?: number;
  paidBy?: number;
};

// other user operation on user model

export function toExpenseModel(expenseDTO: ExpenseDTO): ExpenseModel {
  return {
    id: expenseDTO.id,
    amount: expenseDTO.amount,
    name: expenseDTO.name,
    splitType: expenseDTO.splitType,
  };
}
