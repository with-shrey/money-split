import { ExpenseDTO, ExpensePartDTO } from './expense-repository';

/**
 * @openapi
 * components:
 *   schemas:
 *     ExpensePartModel:
 *       description: Expense part model
 *       required:
 *         - id
 *         - name
 *         - amount
 *         - splitType
 *       properties:
 *         splitAmount:
 *           type: number
 *           description: amount
 *         owedBy:
 *           type: number
 *         owedTo:
 *           type: number
 */
export type ExpensePartModel = {
  splitAmount: number;
  owedBy: number;
  owedTo: number;
};

/**
 * @openapi
 * components:
 *   schemas:
 *     Expense:
 *       description: Expense model
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
 *           type: string
 *           enum: [equal, percentage]
 *         parts:
 *           type: array
 *           items:
 *                 $ref: "#/components/schemas/ExpensePartModel"
 */
export type ExpenseModel = {
  id?: number;
  amount: number;
  name: string;
  splitType: 'equal' | 'percentage';
  groupId?: number;
  paidBy?: number;
  parts?: ExpensePartModel[];
};

/**
 * @openapi
 * components:
 *   schemas:
 *     BalanceModel:
 *       description: Balances
 *       properties:
 *         userId:
 *           type: number
 *         amountOwedByUser:
 *           type: number
 *         amountOwedToUser:
 *           type: number
 *         balance:
 *           type: number
 */
export type BalanceModel = {
  userId: number;
  amountOwedByUser: number;
  amountOwedToUser: number;
  balance: number;
};
// other user operation on user model

export function toExpenseModel(expenseDTO: ExpenseDTO, parts: ExpensePartDTO[]): ExpenseModel {
  return {
    id: expenseDTO.id,
    amount: expenseDTO.amount,
    name: expenseDTO.name,
    splitType: expenseDTO.splitType,
    parts: parts?.map((part) => ({
      splitAmount: part.splitAmount,
      owedBy: part.owedBy,
      owedTo: part.owedTo,
    })),
  };
}
