export const walletSummary = {
  userName: "Atlay",
  totalBalance: 117.14,
  mainCurrency: "MXN",
  monthlyChange: 8.4,
  availableCredit: 48200,
  pendingTransfers: 3,
};

export const accounts = [
  {
    id: "mxn-remunerada",
    name: "Cuenta Remunerada",
    type: "Ahorro",
    currency: "MXN",
    balance: 0.00,
    cardNumber: "9942",
    accent: "from-[#413484] to-[#22295e]",
    rate: "⚡ 15.00% anual (fijo)"
  },
  {
    id: "mxn-main",
    name: "Peso",
    type: "Debito",
    currency: "MXN",
    balance: 117.14,
    cardNumber: "4832",
    accent: "from-slate-950 to-cyan-700",
    rate: "Débito local"
  },
  {
    id: "usd-travel",
    name: "Dolar",
    type: "Multidivisa",
    currency: "USD",
    balance: 0.00,
    cardNumber: "1298",
    accent: "from-emerald-700 to-slate-900",
    rate: "Banca internacional"
  },
  {
    id: "eur-savings",
    name: "Euro",
    type: "Ahorro",
    currency: "EUR",
    balance: 0.00,
    cardNumber: "7714",
    accent: "from-indigo-800 to-slate-950",
    rate: "Ahorros UE"
  },
  {
    id: "gbp-pound",
    name: "Libra",
    type: "Multidivisa",
    currency: "GBP",
    balance: 0.00,
    cardNumber: "4401",
    accent: "from-blue-900 to-slate-950",
    rate: "Libra esterlina"
  },
  {
    id: "chf-franc",
    name: "Franco",
    type: "Multidivisa",
    currency: "CHF",
    balance: 0.00,
    cardNumber: "5502",
    accent: "from-red-800 to-slate-950",
    rate: "Franco suizo"
  },
  {
    id: "jpy-yen",
    name: "Yen",
    type: "Multidivisa",
    currency: "JPY",
    balance: 0.00,
    cardNumber: "6603",
    accent: "from-white to-red-700",
    rate: "Yen japones"
  },
];

export const exchangeRates = [
  {
    pair: "USD/MXN",
    rate: 18.22,
    change: 0.42,
    trend: [36, 42, 39, 48, 45, 52, 57, 54, 61, 64, 68, 72],
  },
  {
    pair: "EUR/MXN",
    rate: 19.73,
    change: -0.18,
    trend: [64, 62, 58, 61, 56, 55, 52, 49, 51, 47, 45, 43],
  },
  {
    pair: "GBP/MXN",
    rate: 23.04,
    change: 0.27,
    trend: [44, 46, 48, 45, 52, 55, 53, 58, 61, 59, 63, 67],
  },
  {
    pair: "CHF/MXN",
    rate: 22.41,
    change: 0.16,
    trend: [48, 50, 49, 52, 54, 53, 56, 58, 57, 60, 62, 61],
  },
  {
    pair: "JPY/MXN",
    rate: 0.13,
    change: -0.04,
    trend: [62, 60, 59, 58, 56, 57, 55, 54, 52, 51, 50, 49],
  },
  {
    pair: "CAD/MXN",
    rate: 13.31,
    change: 0.11,
    trend: [40, 43, 41, 45, 47, 48, 50, 52, 51, 54, 56, 58],
  },
];

export const recentTransactions = [
  {
    id: "tx-1",
    merchant: "Transferencia a Sofia",
    category: "Envio",
    amount: -2400,
    currency: "MXN",
    date: "Hoy, 11:42",
  },
  {
    id: "tx-2",
    merchant: "Conversion USD a MXN",
    category: "Divisas",
    amount: 5480.6,
    currency: "MXN",
    date: "Hoy, 09:18",
  },
  {
    id: "tx-3",
    merchant: "Pago tarjeta digital",
    category: "Tarjeta",
    amount: -1260.75,
    currency: "MXN",
    date: "Ayer, 18:04",
  },
  {
    id: "tx-4",
    merchant: "Deposito nomina",
    category: "Ingreso",
    amount: 18500,
    currency: "MXN",
    date: "28 Jun, 08:10",
  },
];

export const transferContacts = [
  { id: "contact-1", name: "Sofia", initials: "SO", account: "MXN 4832" },
  { id: "contact-2", name: "Marco", initials: "MA", account: "USD 1298" },
  { id: "contact-3", name: "Ana", initials: "AN", account: "EUR 7714" },
];
