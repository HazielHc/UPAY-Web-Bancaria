const ACCOUNT_URL = process.env.ACCOUNT_SERVICE_URL as string;

export type ApplyDirection = 'debit' | 'credit';

export interface ApplyBalanceResponse {
    status: 'applied' | 'already_applied' | 'insufficient_funds' | 'account_not_found';
    balanceAfter?: string;
}

export async function checkAccountExists(
    accountId: string,
    token: string,
    ): Promise<{ exists: boolean; currency?: string }> {
    const res = await fetch(`${ACCOUNT_URL}/internal/accounts/${accountId}/exists`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return { exists: false };
    if (!res.ok) throw new Error(`account exists check failed: ${res.status}`);
    return res.json() as Promise<{ exists: boolean; currency?: string }>;
}

export async function applyBalance(
    params: {
        operationId: string;
        accountId: string;
        direction: ApplyDirection;
        amount: string;
    },
    token: string,
    ): Promise<ApplyBalanceResponse> {
    const res = await fetch(`${ACCOUNT_URL}/internal/balance-operations`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
    });

    if (res.status === 200 || res.status === 409 || res.status === 404) {
        return res.json() as Promise<ApplyBalanceResponse>;
    }
    throw new Error(`applyBalance failed: ${res.status}`);
}
