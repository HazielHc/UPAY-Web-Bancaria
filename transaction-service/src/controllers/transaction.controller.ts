import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middleware/auth';
import * as service from '../services/transaction.service';
import * as repo from '../models/transaction.model';

const transferSchema = z.object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    amount: z.string().regex(/^\d+(\.\d{1,4})?$/, 'amount debe ser decimal positivo'),
    currency: z.string().length(3).default('MXN'),
    description: z.string().max(255).optional(),
});

export async function createTransfer(req: AuthedRequest, res: Response) {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
        const result = await service.transfer({
        ...parsed.data,
        initiatedBy: req.profileId!,
        token: req.rawToken!,
        });

        if (result.status === 'completed') {
        return res.status(201).json(result);
        }
        return res.status(409).json(result);
    } catch (err) {
        if (err instanceof service.ValidationError) {
        return res.status(400).json({ error: err.message });
        }
        throw err;
    }
}

export async function getTransfer(req: AuthedRequest, res: Response) {
    const tx = await repo.getById(req.params.id, req.profileId!);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(tx);
}

export async function listTransfers(req: AuthedRequest, res: Response) {
    const txs = await repo.listByInitiator(req.profileId!);
    return res.json(txs);
}
