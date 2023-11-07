import { UserService } from 'business/user/user-service';
import { ExpenseModel, toExpenseModel } from './expense-model';
import { ExpensePartDTO, ExpenseRepository } from './expense-repository';
import { AppError } from '../../base/errors';

export class ExpenseService {
  constructor(
    public expenseRepository: ExpenseRepository,
    public userService: UserService,
  ) {
    this.expenseRepository = expenseRepository;
    this.userService = userService;
  }

  createExpense = async (
    expense: ExpenseModel,
    parts: { userId: number; split: number }[],
  ): Promise<ExpenseModel> => {
    if (!expense.groupId) {
      throw new AppError('Group id is required');
    }
    const usersInGroup = await this.userService.getUsersByGroupId(expense.groupId);
    const paidByUser = usersInGroup.find((user) => user.id === expense.paidBy);
    if (!paidByUser) {
      throw new AppError('User who paid is not part of this group');
    }

    const expenseParts: ExpensePartDTO[] = [];
    if (expense.splitType === 'equal') {
      const userShare = expense.amount / usersInGroup.length;
      // split amount equally between all users
      usersInGroup.forEach((user) => {
        if (user.id !== expense.paidBy) {
          expenseParts.push({
            expenseId: expense.id,
            splitAmount: userShare,
            owedBy: user.id ?? -1,
            owedTo: expense.paidBy ?? -1,
          });
        }
      });
    } else if (expense.splitType === 'percentage') {
      // check for parts and validate if it totals to 100
      if (parts.reduce((acc, part) => acc + part.split, 0) !== 100) {
        throw new AppError('Split percentage should total to 100');
      }
      // validate if userId in parts are part of this account
      const partMap: { [_: number]: { userId: number; split: number } } = {};
      parts.forEach((part) => {
        partMap[part.userId] = part;
        const user = usersInGroup.find((userInGroup) => userInGroup.id === part.userId);
        if (!user) {
          throw new AppError(`User: ${part.userId} not found in this account`);
        }
        if (user.id !== expense.paidBy) {
          expenseParts.push({
            expenseId: expense.id,
            splitAmount: (expense.amount * part.split) / 100,
            owedBy: user.id ?? -1,
            owedTo: expense.paidBy ?? -1,
          });
        }
      });
    }

    const { expense: expenseDTO, parts: partsDTOs } = await this.expenseRepository.insertExpense(
      { ...expense, groupId: expense.groupId ?? -1 },
      expenseParts,
    );
    return toExpenseModel(expenseDTO, partsDTOs);
  };
}
