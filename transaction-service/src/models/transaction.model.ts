import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export type TxStatus = 'pending' | 'completed' | 'failed';

export interface Transaction extends RowDataPacket {
    id: string;
    from_account_id: string;
    to_account_id: string;
    initiated_by: string;
    amount: string;
    currency: string;
    status: TxStatus;
    description: string | null;
    failure_reason: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateTxInput {
    fromAccountId: string;
    toAccountId: string;
    initiatedBy: string;
    amount: string;
    currency: string;
    description?: string;
}

export async function createPending(input: CreateTxInput): Promise<string> {
    const id = randomUUID();
    await pool.execute<ResultSetHeader>(
        `INSERT INTO transactions
        (id, from_account_id, to_account_id, initiated_by, amount, currency, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
        id,
        input.fromAccountId,
        input.toAccountId,
        input.initiatedBy,
        input.amount,
        input.currency,
        input.description ?? null,
        ],
    );
    return id;
}

export async function markCompleted(id: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `UPDATE transactions SET status = 'completed' WHERE id = ?`,
        [id],
    );
}

export async function markFailed(id: string, reason: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
        `UPDATE transactions SET status = 'failed', failure_reason = ? WHERE id = ?`,
        [reason, id],
    );
}

export async function getById(id: string, initiatedBy: string): Promise<Transaction | null> {
    const [rows] = await pool.execute<Transaction[]>(
        `SELECT * FROM transactions WHERE id = ? AND initiated_by = ? LIMIT 1`,
        [id, initiatedBy],
    );
    return rows[0] ?? null;
}

export async function listByInitiator(initiatedBy: string): Promise<Transaction[]> {
    const [rows] = await pool.execute<Transaction[]>(
        `SELECT * FROM transactions WHERE initiated_by = ? ORDER BY created_at DESC`,
        [initiatedBy],
    );
    return rows;
}
