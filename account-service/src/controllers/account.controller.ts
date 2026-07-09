import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middlewares/auth';
import * as repo from '../models/account.model';

const createSchema = z.object({
    bankName: z.string().min(1).max(100),
    accountType: z.enum(['checking', 'savings']).default('checking'),
    currency: z.string().length(3).default('MXN'),
});

export async function create(req: AuthedRequest, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }
    const account = await repo.createAccount({
        profileId: req.profileId!,
        ...parsed.data,
    });
    return res.status(201).json(account);
}

export async function list(req: AuthedRequest, res: Response) {
    const accounts = await repo.getAccountsByProfile(req.profileId!);
    return res.json(accounts);
}

export async function getOne(req: AuthedRequest, res: Response) {
    const account = await repo.getAccountById(req.params.id, req.profileId!);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    return res.json(account);
}

export async function remove(req: AuthedRequest, res: Response) {
    const ok = await repo.deleteAccount(req.params.id, req.profileId!);
    if (!ok) return res.status(404).json({ error: 'Account not found' });
    return res.status(204).send();
}
