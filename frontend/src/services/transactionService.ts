import { apiFetch } from "./apiClient";

export const createTransfer = (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    currency: string;
    description?: string;
    }) => apiFetch("transaction", "/transactions", {
    method: "POST",
    body: JSON.stringify(data),
});

export const getTransfers = () => apiFetch("transaction", "/transactions");