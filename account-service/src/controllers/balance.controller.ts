import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middlewares/auth';
import * as balanceRepo from '../models/balance.model';
import * as accountRepo from '../models/account.model'; 

const applySchema = z.object({
    operationId: z.string().min(1).max(80),
    accountId: z.string().uuid(),
    direction: z.enum(['debit', 'credit']),
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'amount debe ser un decimal positivo'),
});

    export async function applyBalance(req: AuthedRequest, res: Response) {
    const parsed = applySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await balanceRepo.applyBalanceChange(parsed.data);

    switch (result.status) {
        case 'applied':
        return res.status(200).json({ status: 'applied', balanceAfter: result.balanceAfter });
        case 'already_applied':
        return res.status(200).json({ status: 'already_applied', balanceAfter: result.balanceAfter });
        case 'insufficient_funds':
        return res.status(409).json({ status: 'insufficient_funds' });
        case 'account_not_found':
        return res.status(404).json({ status: 'account_not_found' });
    }
}

export async function accountExists(req: AuthedRequest, res: Response) {
    const account = await accountRepo.getAccountByIdAny(req.params.id);
    if (!account || account.status !== 'active') {
        return res.status(404).json({ exists: false });
    }
    return res.json({ exists: true, currency: account.currency });
}