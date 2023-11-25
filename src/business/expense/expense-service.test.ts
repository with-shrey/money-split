import { splitByPercentage, splitEqually } from "./expense-service";

describe('ExpenseService', () => {
  describe('splitEqually', () => {
    it('should split equally between all users', () => {
      // Arrange
      const expense = {
        id: 1,
        name: 'Test Expense',
        splitType: 'equal' as const,
        amount: 300,
        paidBy: 1,
      };
      const usersInGroup = [
        { id: 1, name: 'John Doe', phone: '' },
        { id: 2, name: 'Jane Doe', phone: '' },
        { id: 3, name: 'Jack Doe', phone: '' },
      ];
      // Act
      const expenseParts = splitEqually(expense, usersInGroup);
      // Assert
      expect(expenseParts).toEqual([
        {
          expenseId: 1,
          splitAmount: 100,
          owedBy: 2,
          owedTo: 1,
        },
        {
          expenseId: 1,
          splitAmount: 100,
          owedBy: 3,
          owedTo: 1,
        },
      ]);
    });
  });

  describe('splitByPercentage', () => {
    it('should split by percentage between all users', () => {
      // Arrange
      const expense = {
        id: 1,
        name: 'Test Expense',
        splitType: 'percentage' as const,
        amount: 300,
        paidBy: 1,
      };
      const usersInGroup = [
        { id: 1, name: 'John Doe', phone: '' },
        { id: 2, name: 'Jane Doe', phone: '' },
        { id: 3, name: 'Jack Doe', phone: '' },
      ];
      const parts = [
        { userId: 2, split: 50 },
        { userId: 3, split: 50 },
      ];
      // Act
      const expenseParts = splitByPercentage(expense, usersInGroup, parts);
      // Assert
      expect(expenseParts).toEqual([
        {
          expenseId: 1,
          splitAmount: 150,
          owedBy: 2,
          owedTo: 1,
        },
        {
          expenseId: 1,
          splitAmount: 150,
          owedBy: 3,
          owedTo: 1,
        },
      ]);
    });
  });
});
