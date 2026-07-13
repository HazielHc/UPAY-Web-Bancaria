import { Response, Request } from 'express';
import { z } from 'zod';
import * as ratesClient from './rates.client';

// GET /rates/pair?from=MXN&to=USD  -> tasa puntual (para cuando account-service
// va a EJECUTAR una conversión real y necesita el número exacto y fresco).
const pairSchema = z.object({
    from: z.string().length(3),
    to: z.string().length(3),
});

export async function getPairRate(req: Request, res: Response) {
    const parsed = pairSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
        const rate = await ratesClient.getRate(parsed.data.from, parsed.data.to);
        return res.json({ from: parsed.data.from, to: parsed.data.to, rate });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}

// GET /rates?from=MXN&symbols=USD,EUR,GBP -> varias tasas (para la vista
// INFORMATIVA del Dashboard: "si convirtieras ahora, tendrías esto en cada moneda").
const listSchema = z.object({
  from: z.string().length(3),
  symbols: z.string().optional(), // coma-separado; si no viene, usa todas las soportadas
});

export async function getRatesList(req: Request, res: Response) {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const targets = parsed.data.symbols
        ? parsed.data.symbols.split(',')
        : ratesClient.getSupportedCurrencies().filter((c) => c !== parsed.data.from);

    try {
        const rates = await ratesClient.getRatesFor(parsed.data.from, targets);
        return res.json({ from: parsed.data.from, rates });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}
