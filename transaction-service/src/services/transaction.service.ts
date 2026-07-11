import * as repo from '../models/transaction.model';
import * as account from '../clients/account.client';

export interface TransferInput {
    fromAccountId: string;
    toAccountId: string;
    amount: string;       
    currency: string;
    description?: string;
    initiatedBy: string;  
    token: string;        
}

export interface TransferResult {
    status: 'completed' | 'failed';
    transactionId: string;
    reason?: string;
}

export async function transfer(input: TransferInput): Promise<TransferResult> {
    const { fromAccountId, toAccountId, amount, currency, token } = input;

    if (fromAccountId === toAccountId) {
        throw new ValidationError('No puedes transferir a la misma cuenta');
    }
    const destino = await account.checkAccountExists(toAccountId, token);
    if (!destino.exists) {
        throw new ValidationError('La cuenta destino no existe o no está activa');
    }

    const txId = await repo.createPending({
        fromAccountId,
        toAccountId,
        initiatedBy: input.initiatedBy,
        amount,
        currency,
        description: input.description,
    });

    const debit = await account.applyBalance(
        { operationId: `${txId}-debit`, accountId: fromAccountId, direction: 'debit', amount },
        token,
    );

    if (debit.status === 'insufficient_funds') {
        await repo.markFailed(txId, 'Saldo insuficiente en la cuenta origen');
        return { status: 'failed', transactionId: txId, reason: 'insufficient_funds' };
    }
    if (debit.status === 'account_not_found') {
        await repo.markFailed(txId, 'Cuenta origen no encontrada');
        return { status: 'failed', transactionId: txId, reason: 'account_not_found' };
    }

    let credit: account.ApplyBalanceResponse;
    try {
        credit = await account.applyBalance(
        { operationId: `${txId}-credit`, accountId: toAccountId, direction: 'credit', amount },
        token,
        );
    } catch (err) {
        await compensate(txId, fromAccountId, amount, token);
        await repo.markFailed(txId, 'Fallo al acreditar destino; débito revertido');
        return { status: 'failed', transactionId: txId, reason: 'credit_failed_compensated' };
    }

    if (credit.status !== 'applied' && credit.status !== 'already_applied') {
        await compensate(txId, fromAccountId, amount, token);
        await repo.markFailed(txId, `Crédito rechazado (${credit.status}); débito revertido`);
        return { status: 'failed', transactionId: txId, reason: 'credit_rejected_compensated' };
    }

    await repo.markCompleted(txId);
    return { status: 'completed', transactionId: txId };
}

async function compensate(
    txId: string,
    fromAccountId: string,
    amount: string,
    token: string,
    ): Promise<void> {
    try {
        await account.applyBalance(
        { operationId: `${txId}-compensate`, accountId: fromAccountId, direction: 'credit', amount },
        token,
        );
    } catch (err) {
        console.error(`[COMPENSATION FAILED] tx=${txId} account=${fromAccountId} amount=${amount}`, err);
    }
}

export class ValidationError extends Error {}
