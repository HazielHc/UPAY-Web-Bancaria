const API_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL,
  account: import.meta.env.VITE_ACCOUNT_SERVICE_URL,
  transaction: import.meta.env.VITE_TRANSACTION_SERVICE_URL,
  currency: import.meta.env.VITE_CURRENCY_SERVICE_URL, // ← nuevo
};

type Service = keyof typeof API_URLS;

export async function apiFetch(
    service: Service,
    path: string,
    options: RequestInit = {}
    ) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URLS[service]}${path}`, {
        ...options,
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error ?? data.message ?? "Request failed");
    }

    return data;
}