// currencyService.ts
import { apiFetch } from "./apiClient";

// Trae varias tasas a la vez, partiendo de una moneda. Para la vista informativa.
export const getRates = (from: string, symbols: string[]) => {
  const query = `?from=${from}&symbols=${symbols.join(",")}`;
  return apiFetch("currency", `/rates${query}`);
};