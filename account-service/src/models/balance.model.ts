import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export type Direction = 'debit' | 'credit';

export interface ApplyBalanceInput {
    operationId: string;   
    accountId: string;
    direction: Direction;
    amount: string;        
}

export interface ApplyBalanceResult {
    status: 'applied' | 'already_applied' | 'insufficient_funds' | 'account_not_found';
    balanceAfter?: string;
}

export async function applyBalanceChange(
    input: ApplyBalanceInput,
    ): Promise<ApplyBalanceResult> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [existing] = await conn.execute<RowDataPacket[]>(
        `SELECT balance_after FROM balance_operations WHERE operation_id = ? LIMIT 1`,
        [input.operationId],
        );
        if (existing.length > 0) {
        await conn.commit();
        return { status: 'already_applied', balanceAfter: existing[0].balance_after };
        }

        const [accounts] = await conn.execute<RowDataPacket[]>(
        `SELECT balance FROM accounts WHERE id = ? FOR UPDATE`,
        [input.accountId],
        );
        if (accounts.length === 0) {
        await conn.rollback();
        return { status: 'account_not_found' };
        }

        const current = accounts[0].balance as string; // DECIMAL como string

        const currentMinor = toMinorUnits(current);
        const amountMinor = toMinorUnits(input.amount);

        let newMinor: bigint;
        if (input.direction === 'debit') {
        if (currentMinor < amountMinor) {
            await conn.rollback();
            return { status: 'insufficient_funds' };
        }
        newMinor = currentMinor - amountMinor;
        } else {
        newMinor = currentMinor + amountMinor;
        }

        const newBalance = fromMinorUnits(newMinor);

        await conn.execute<ResultSetHeader>(
        `UPDATE accounts SET balance = ? WHERE id = ?`,
        [newBalance, input.accountId],
        );
        await conn.execute<ResultSetHeader>(
        `INSERT INTO balance_operations
            (operation_id, account_id, direction, amount, balance_after)
        VALUES (?, ?, ?, ?, ?)`,
        [input.operationId, input.accountId, input.direction, input.amount, newBalance],
        );

        await conn.commit();
        return { status: 'applied', balanceAfter: newBalance };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

function toMinorUnits(value: string): bigint {
    const [intPart, fracPartRaw = ''] = value.split('.');
    const fracPart = (fracPartRaw + '0000').slice(0, 4); 
    const sign = intPart.startsWith('-') ? -1n : 1n;
    const intAbs = intPart.replace('-', '');
    return sign * (BigInt(intAbs) * 10000n + BigInt(fracPart));
}

function fromMinorUnits(minor: bigint): string {
    const neg = minor < 0n;
    const abs = neg ? -minor : minor;
    const intPart = abs / 10000n;
    const fracPart = (abs % 10000n).toString().padStart(4, '0');
    return `${neg ? '-' : ''}${intPart.toString()}.${fracPart}`;
}