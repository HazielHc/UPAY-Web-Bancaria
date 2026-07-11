import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface Account extends RowDataPacket {
    id: string;
    profile_id: string;
    bank_name: string;
    account_type: 'checking' | 'savings';
    balance: string; 
    currency: string;
    status: 'active' | 'frozen' | 'closed';
    created_at: Date;
    updated_at: Date;
}

export interface CreateAccountInput {
    profileId: string;
    bankName: string;
    accountType: 'checking' | 'savings';
    currency: string;
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
    const id = randomUUID();
    await pool.execute<ResultSetHeader>(
        `INSERT INTO accounts (id, profile_id, bank_name, account_type, currency)
        VALUES (?, ?, ?, ?, ?)`,
        [id, input.profileId, input.bankName, input.accountType, input.currency],
    );
    return (await getAccountById(id, input.profileId)) as Account;
}

export async function getAccountsByProfile(profileId: string): Promise<Account[]> {
    const [rows] = await pool.execute<Account[]>(
        `SELECT * FROM accounts WHERE profile_id = ? ORDER BY created_at DESC`,
        [profileId],
    );
    return rows;
}

export async function getAccountById(id: string, profileId: string): Promise<Account | null> {
    const [rows] = await pool.execute<Account[]>(
        `SELECT * FROM accounts WHERE id = ? AND profile_id = ? LIMIT 1`,
        [id, profileId],
    );
    return rows[0] ?? null;
}

export async function deleteAccount(id: string, profileId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
        `DELETE FROM accounts WHERE id = ? AND profile_id = ?`,
        [id, profileId],
    );
    return result.affectedRows > 0;
}

export async function getAccountByIdAny(id: string): Promise<Account | null> {
    const [rows] = await pool.execute<Account[]>(
        `SELECT * FROM accounts WHERE id = ? LIMIT 1`,
        [id],
    );
    return rows[0] ?? null;
}