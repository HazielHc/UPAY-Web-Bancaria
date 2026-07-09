import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface Card extends RowDataPacket {
    id: string;
    account_id: string;
    last4: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'other';
    card_type: 'debit' | 'credit';
    expiry_month: number;
    expiry_year: number;
    status: 'active' | 'blocked' | 'expired';
    created_at: Date;
    updated_at: Date;
}

export interface CreateCardInput {
    accountId: string;
    last4: string;
    brand: Card['brand'];
    cardType: Card['card_type'];
    expiryMonth: number;
    expiryYear: number;
}

export async function createCard(input: CreateCardInput): Promise<Card> {
    const id = randomUUID();
    await pool.execute<ResultSetHeader>(
        `INSERT INTO cards (id, account_id, last4, brand, card_type, expiry_month, expiry_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, input.accountId, input.last4, input.brand, input.cardType, input.expiryMonth, input.expiryYear],
    );
    const [rows] = await pool.execute<Card[]>(`SELECT * FROM cards WHERE id = ?`, [id]);
    return rows[0];
}

export async function getCardsByAccount(accountId: string): Promise<Card[]> {
    const [rows] = await pool.execute<Card[]>(
        `SELECT * FROM cards WHERE account_id = ? ORDER BY created_at DESC`,
        [accountId],
    );
    return rows;
}
