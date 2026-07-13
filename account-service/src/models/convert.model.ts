import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { getFreshRate } from '../clients/currency.client';

export interface ConvertResult {
    status: 'converted' | 'account_not_found' | 'same_currency';
    newCurrency?: string;
    newBalance?: string;
    rateApplied?: number;
}

export async function convertAccountCurrency(
    accountId: string,
    toCurrency: string,
    token: string,
    ): Promise<ConvertResult> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
    
        const [accounts] = await conn.execute<RowDataPacket[]>(
        `SELECT balance, currency FROM accounts WHERE id = ? FOR UPDATE`,
        [accountId],
        );
        if (accounts.length === 0) {
        await conn.rollback();
        return { status: 'account_not_found' };
        }
    
        const currentBalance = accounts[0].balance as string; 
        const currentCurrency = accounts[0].currency as string;
    
        if (currentCurrency === toCurrency) {
        await conn.rollback();
        return { status: 'same_currency' };
        }
    
        const rate = await getFreshRate(currentCurrency, toCurrency, token);
    
        const newBalanceNum = Number(currentBalance) * rate;
        const newBalance = newBalanceNum.toFixed(4);
    
        await conn.execute<ResultSetHeader>(
        `UPDATE accounts SET balance = ?, currency = ? WHERE id = ?`,
        [newBalance, toCurrency, accountId],
        );
    
        await conn.commit();
        return { status: 'converted', newCurrency: toCurrency, newBalance, rateApplied: rate };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}