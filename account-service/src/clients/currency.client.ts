const CURRENCY_URL = process.env.CURRENCY_SERVICE_URL as string;

export async function getFreshRate(from: string, to: string, token: string): Promise<number> { 
    const res = await fetch(
        `${CURRENCY_URL}/rates/pair?from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!res.ok) {
        throw new Error(`currency-service respondió ${res.status} al pedir ${from}->${to}`);
    }

    const data = await res.json();
    return data.rate as number; 
}