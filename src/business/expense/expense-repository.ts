import { Pool } from 'pg';
import format from 'pg-format';

export type ExpenseDTO = {
  id?: number;
  name: string;
  amount: number;
  splitType: 'equal' | 'percentage';
  groupId: number;
};

export type ExpensePartDTO = {
  id?: number;
  expenseId?: number;
  splitAmount: number;
  owedBy: number;
  owedTo: number;
};

export type BalanceDTO = {
  userId: number;
  amountOwedByUser: number;
  amountOwedToUser: number;
  balance: number;
};

/* eslint-disable no-unused-vars */
export interface ExpenseRepository {
  insertExpense(
    expense: ExpenseDTO,
    parts: ExpensePartDTO[],
  ): Promise<{ expense: ExpenseDTO; parts: ExpensePartDTO[] }>;
  getExpensesBetweenTwoUsers(
    user1ID: number,
    user2Id: number,
  ): Promise<{ expenses: ExpenseDTO[]; parts: ExpensePartDTO[] }>;
  getBalancesForUserID(userID: number): Promise<BalanceDTO[]>;
}

export class DBExpenseRepository implements ExpenseRepository {
  constructor(public db: Pool) {
    this.db = db;
  }

  insertExpense = async (
    expense: ExpenseDTO,
    parts: ExpensePartDTO[],
  ): Promise<{ expense: ExpenseDTO; parts: ExpensePartDTO[] }> => {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN'); // Start the transaction

      const createExpense = `
        INSERT INTO expenses (name, amount, split_type, group_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, amount, split_type, group_id
      `;
      const expenseCreationResult = await client.query(createExpense, [
        expense.name,
        expense.amount,
        expense.splitType,
        expense.groupId,
      ]);
      const expenseRecord = expenseCreationResult.rows[0];
      const expenseId = expenseCreationResult.rows[0].id;
      const insertParts = `
      INSERT INTO expense_parts (expense_id, owed_by, owed_to, split_amount)
      VALUES  %L
      RETURNING owed_by, owed_to, split_amount
      `;
      const values = parts.map((part) => [expenseId, part.owedBy, part.owedTo, part.splitAmount]);
      let partsDTO: ExpensePartDTO[] = [];
      if (values.length > 0) {
        const formattedInsertPartsQuery = format(insertParts, values);
        const insertedParts = await client.query(formattedInsertPartsQuery);
        partsDTO = this.toExpensePartDTOArray(insertedParts);
      }
      await client.query('COMMIT');
      return { expense: this.toExpenseDTO(expenseRecord), parts: partsDTO };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  getExpensesBetweenTwoUsers = async (
    user1ID: number,
    user2Id: number,
  ): Promise<{ expenses: ExpenseDTO[]; parts: ExpensePartDTO[] }> => {
    const getExpensesBetweenUsers = `
      SELECT 
        expenses.id AS id,
        name,
        amount,
        split_type,
        group_id,

        expense_id,
        owed_by,
        owed_to,
        split_amount
      FROM expenses
      LEFT JOIN expense_parts ON expense_parts.expense_id = expenses.id
      WHERE owed_by IN ($1, $2) AND owed_to IN ($1, $2)
    `;
    const result = await this.db.query(getExpensesBetweenUsers, [user1ID, user2Id]);
    const expenseDTO = this.toExpenseDTOArray(result);
    const expensePartDTO = this.toExpensePartDTOArray(result);
    return {
      expenses: expenseDTO,
      parts: expensePartDTO,
    };
  };

  getBalancesForUserID = async (userId: number): Promise<BalanceDTO[]> => {
    const getBalance = `
    WITH owed_by_user AS (
      SELECT owed_to AS user_id, SUM(split_amount) AS amount_owed
      FROM expense_parts
      WHERE owed_by = $1
      GROUP BY owed_to
    ), owed_to_user AS (
      SELECT owed_by AS user_id, SUM(split_amount) AS amount_owed_to
      FROM expense_parts
      WHERE owed_to = $1 
      GROUP BY owed_by
    )
    SELECT
      COALESCE(owed_by_user.user_id, owed_to_user.user_id) AS "userId",
      COALESCE(owed_by_user.amount_owed, 0) AS "amountOwedByUser",
      COALESCE(owed_to_user.amount_owed_to, 0) AS "amountOwedToUser",
      COALESCE(owed_to_user.amount_owed_to, 0) - COALESCE(owed_by_user.amount_owed, 0) AS balance
    FROM owed_by_user
    FULL OUTER JOIN owed_to_user owed_to_user ON owed_by_user.user_id = owed_to_user.user_id
    ORDER BY balance;    
    `;

    const result = await this.db.query(getBalance, [userId]);
    return result.rows;
  };

  toExpenseDTO = (row: any): ExpenseDTO => ({
    id: row.id,
    name: row.name,
    amount: row.amount,
    splitType: row.split_type,
    groupId: row.group_id,
  });

  toExpenseDTOArray = (result: any): ExpenseDTO[] =>
    result.rows.map((row: any) => this.toExpenseDTO(row));

  toExpensePartDTO = (row: any): ExpensePartDTO => ({
    id: row.id,
    expenseId: row.expense_id,
    splitAmount: row.split_amount,
    owedBy: row.owed_by,
    owedTo: row.owed_to,
  });

  toExpensePartDTOArray = (result: any): ExpensePartDTO[] =>
    result.rows.map((row: any) => this.toExpensePartDTO(row));
}
