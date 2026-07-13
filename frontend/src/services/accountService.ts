import { apiFetch } from "./apiClient";


export const getAccounts = () => apiFetch("account", "/accounts");

export const getDashboardData = async () => {
    const accounts = await getAccounts();

    const adaptedAccounts = accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.bank_name,
        balance: Number(acc.balance),      
        currency: acc.currency,
        rate: null,                         
    }));

    return {
        accounts: adaptedAccounts,
        exchangeRates: [],       
        transferContacts: [],    
    };
};

export const createAccount = (data: {
    bankName: string;
    accountType: "checking" | "savings";
    currency: string;
}) => apiFetch("account", "/accounts", {
    method: "POST",
    body: JSON.stringify(data),
});

export const getCards = (accountId: string) =>
    apiFetch("account", `/accounts/${accountId}/cards`);

export const createCard = (accountId: string, data: {
    last4: string;
    brand: "visa" | "mastercard" | "amex" | "other";
    cardType: "debit" | "credit";
    expiryMonth: number;
    expiryYear: number;
    }) => apiFetch("account", `/accounts/${accountId}/cards`, {
    method: "POST",
    body: JSON.stringify(data),
});

export const getAllUserCards = async () => {
    const accounts = await getAccounts();

    const cardsPerAccount = await Promise.all(
        accounts.map(async (acc) => {
        const cards = await getCards(acc.id);
        return cards.map((card) => ({
            id: card.id,
            accountId: acc.id,
            bankName: acc.bank_name,
            brand: card.brand,
            last4: card.last4,
        }));
        })
    );

    return cardsPerAccount.flat();
};

export const getAccountById = (accountId: string) =>
    apiFetch("account", `/accounts/${accountId}`);
    
    export const convertAccountCurrency = (accountId: string, toCurrency: string) =>
    apiFetch("account", `/accounts/${accountId}/convert`, {
        method: "POST",
        body: JSON.stringify({ toCurrency }),
    });
    

    export const depositToAccount = (accountId: string, amount: string) =>
    apiFetch("account", "/internal/balance-operations", {
        method: "POST",
        body: JSON.stringify({
        operationId: crypto.randomUUID(),
        accountId,
        direction: "credit",
        amount,
        }),
});