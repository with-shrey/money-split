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

export interface ExpenseRepository {
  insertExpense(
    expense: ExpenseDTO,
    parts: ExpensePartDTO[],
  ): Promise<{ expense: ExpenseDTO; parts: ExpensePartDTO[] }>;
  // TODO: getExpensesBetweenTwoUsers(user1ID: number, user2Id: number): Promise<ExpenseDTO>;
  // TODO: getBalancesForUserID(userID: number): Promise<any>;
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
