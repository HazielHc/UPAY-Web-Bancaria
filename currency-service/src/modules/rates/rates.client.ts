const API_BASE = process.env.EXCHANGE_API_BASE_URL as string;
const API_KEY = process.env.EXCHANGE_API_KEY as string;
const SUPPORTED = (process.env.SUPPORTED_CURRENCIES ?? "MXN,USD,EUR,GBP,CHF,JPY").split(",");
const CACHE_TTL_MS = (Number(process.env.CACHE_TTL_HOURS) || 6) * 60 * 60 * 1000;

interface RatesSnapshot {
    base: "EUR";
    rates: Record<string, number>; // ej. { MXN: 18.7, USD: 1.09, EUR: 1 }
    fetchedAt: number; // epoch ms
}

let cache: RatesSnapshot | null = null;
let inFlight: Promise<RatesSnapshot> | null = null; // evita llamadas duplicadas simultáneas

function isFresh(snapshot: RatesSnapshot): boolean {
    return Date.now() - snapshot.fetchedAt < CACHE_TTL_MS;
}

async function fetchFreshRates(): Promise<RatesSnapshot> {
    const symbols = SUPPORTED.join(",");
    const url = `${API_BASE}/latest?access_key=${API_KEY}&base=EUR&symbols=${symbols}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
        throw new Error(`exchangeratesapi error: ${data.error?.code ?? "unknown"} - ${data.error?.message ?? ""}`);
    }

    // EUR siempre debe estar presente para poder hacer de puente hacia sí mismo.
    const rates = { ...data.rates, EUR: 1 };

    return { base: "EUR", rates, fetchedAt: Date.now() };
}

/**
 * Devuelve el snapshot de tasas (base EUR), usando caché si sigue fresca.
 * Si hay una petición en curso, la reutiliza en vez de disparar otra
 * (protege el cupo mensual del plan gratuito ante ráfagas de requests).
 */
async function getSnapshot(): Promise<RatesSnapshot> {
    if (cache && isFresh(cache)) {
        return cache;
    }
    if (inFlight) {
        return inFlight;
    }

    inFlight = fetchFreshRates()
        .then((snapshot) => {
        cache = snapshot;
        return snapshot;
        })
        .finally(() => {
        inFlight = null;
        });

    return inFlight;
}

/** Tasa puntual entre dos monedas soportadas, vía puente EUR. */
export async function getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    const snapshot = await getSnapshot();
    const rateFrom = snapshot.rates[from]; // EUR -> from
    const rateTo = snapshot.rates[to];     // EUR -> to

    if (rateFrom === undefined || rateTo === undefined) {
        throw new Error(`Moneda no soportada: ${!rateFrom ? from : to}`);
    }

    // tasa(from -> to) = (EUR->to) / (EUR->from)
    return rateTo / rateFrom;
    }

    /** Varias tasas a la vez, partiendo de una moneda base, para vistas informativas. */
    export async function getRatesFor(from: string, targets: string[]): Promise<Record<string, number>> {
    const snapshot = await getSnapshot();
    const rateFrom = snapshot.rates[from];
    if (rateFrom === undefined) {
        throw new Error(`Moneda no soportada: ${from}`);
    }

    const result: Record<string, number> = {};
    for (const target of targets) {
        const rateTo = snapshot.rates[target];
        if (rateTo !== undefined) {
        result[target] = target === from ? 1 : rateTo / rateFrom;
        }
    }
    return result;
}

export function getSupportedCurrencies(): string[] {
    return [...SUPPORTED];
}
