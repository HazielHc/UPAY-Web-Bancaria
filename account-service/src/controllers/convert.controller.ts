import { Response } from 'express';
import { z } from 'zod';
import { AuthedRequest } from '../middlewares/auth';
import * as convertRepo from '../models/convert.model';

const convertSchema = z.object({
    toCurrency: z.string().length(3),
});

export async function convertCurrency(req: AuthedRequest, res: Response) {
    const parsed = convertSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const result = await convertRepo.convertAccountCurrency(
        req.params.id,
        parsed.data.toCurrency,
        req.rawToken!,
    );

    switch (result.status) {
        case 'converted':
        return res.status(200).json({
            currency: result.newCurrency,
            balance: result.newBalance,
            rateApplied: result.rateApplied,
        });
        case 'same_currency':
        return res.status(400).json({ error: 'La cuenta ya está en esa moneda' });
        case 'account_not_found':
        return res.status(404).json({ error: 'Account not found' });
    }
}