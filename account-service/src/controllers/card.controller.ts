import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middlewares/auth';
import * as cardRepo from '../models/card.model';
import * as accountRepo from '../models/account.model';

const createSchema = z.object({
    last4: z.string().regex(/^\d{4}$/, 'last4 debe ser 4 dígitos'),
    brand: z.enum(['visa', 'mastercard', 'amex', 'other']).default('other'),
    cardType: z.enum(['debit', 'credit']).default('debit'),
    expiryMonth: z.number().int().min(1).max(12),
    expiryYear: z.number().int().min(2024).max(2099),
});

async function ownsAccount(accountId: string, profileId: string): Promise<boolean> {
    const account = await accountRepo.getAccountById(accountId, profileId);
    return account !== null;
}

export async function create(req: AuthedRequest, res: Response) {
    const { accountId } = req.params;
    if (!(await ownsAccount(accountId, req.profileId!))) {
        return res.status(404).json({ error: 'Account not found' });
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const card = await cardRepo.createCard({ accountId, ...parsed.data });
    return res.status(201).json(card);
}

export async function list(req: AuthedRequest, res: Response) {
    const { accountId } = req.params;
    if (!(await ownsAccount(accountId, req.profileId!))) {
        return res.status(404).json({ error: 'Account not found' });
    }

    const cards = await cardRepo.getCardsByAccount(accountId);
    return res.json(cards);
}
