interface ImportMetaEnv {
    readonly VITE_AUTH_SERVICE_URL: string;
    readonly VITE_ACCOUNT_SERVICE_URL: string;
    readonly VITE_TRANSACTION_SERVICE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}