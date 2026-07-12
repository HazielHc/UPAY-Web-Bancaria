import { apiFetch } from "./apiClient";

// accountService.ts — agregar esto

export const getAccounts = () => apiFetch("account", "/accounts");

// Adapta la forma real de account-service a la que espera el Dashboard.
export const getDashboardData = async () => {
    const accounts = await getAccounts();

    const adaptedAccounts = accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.bank_name,
        balance: Number(acc.balance),      // solo para mostrar, no para operar
        currency: acc.currency,
        rate: null,                         // el mock usaba esto para un detalle visual
    }));

    return {
        accounts: adaptedAccounts,
        exchangeRates: [],       // pendiente: currency-service no existe todavía
        transferContacts: [],    // pendiente: decidir si esto vive en el front o en un backend
    };
};

export const createAccount = (data: {
    bankName: string;
    accountType: "checking" | "savings";
    currency: string;
}) => apiFetch("account", "/accounts", { method: "POST", body: JSON.stringify(data) });