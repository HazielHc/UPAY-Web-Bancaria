import {
  accounts,
  bankAccounts,
  exchangeRates,
  recentTransactions,
  transferContacts,
  walletSummary,
} from "../data/dashboardMock";

// Copias locales en memoria para simular base de datos mutativa
let localAccounts = [...accounts];
let localWalletSummary = { ...walletSummary };
let localTransactions = [...recentTransactions];
let localContacts = [...transferContacts];
let localBankAccounts = bankAccounts.map((account) => ({
  ...account,
  balances: account.balances.map((balance) => ({ ...balance })),
  transactions: account.transactions.map((transaction) => ({ ...transaction })),
}));

const maskAccountNumber = (last4) => `.........${String(last4).slice(-4)}`;

const cloneBankAccount = (account) => ({
  ...account,
  balances: account.balances.map((balance) => ({ ...balance })),
  transactions: account.transactions.map((transaction) => ({ ...transaction })),
});

const getCurrencyRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;

  const directRate = exchangeRates.find((rate) => rate.pair === `${fromCurrency}/${toCurrency}`);
  if (directRate) return directRate.rate;

  const inverseRate = exchangeRates.find((rate) => rate.pair === `${toCurrency}/${fromCurrency}`);
  if (inverseRate) return 1 / inverseRate.rate;

  const fromToMxn = fromCurrency === "MXN"
    ? 1
    : exchangeRates.find((rate) => rate.pair === `${fromCurrency}/MXN`)?.rate;
  const toToMxn = toCurrency === "MXN"
    ? 1
    : exchangeRates.find((rate) => rate.pair === `${toCurrency}/MXN`)?.rate;

  if (!fromToMxn || !toToMxn) return 1;

  return fromToMxn / toToMxn;
};

const findBankBalance = (bankAccount, currency) => {
  let balance = bankAccount.balances.find((item) => item.currency === currency);

  if (!balance) {
    balance = { currency, balance: 0 };
    bankAccount.balances.push(balance);
  }

  return balance;
};

export async function getBankAccounts() {
  return localBankAccounts.map(cloneBankAccount);
}

export async function getBankDashboardData(bankAccountId) {
  const bankAccount = localBankAccounts.find((account) => account.id === bankAccountId) || localBankAccounts[0];

  return {
    bankAccount: cloneBankAccount(bankAccount),
    bankAccounts: localBankAccounts.map(cloneBankAccount),
    exchangeRates,
    transferContacts: localContacts,
  };
}

export async function addMoneyToBankBalance(bankAccountId, currency, amount) {
  const bankAccount = localBankAccounts.find((account) => account.id === bankAccountId);
  const numAmount = parseFloat(amount);

  if (!bankAccount || !numAmount || numAmount <= 0) {
    throw new Error("Monto invalido");
  }

  const balance = findBankBalance(bankAccount, currency);
  balance.balance = parseFloat((balance.balance + numAmount).toFixed(2));

  bankAccount.transactions.unshift({
    id: `bank-tx-${Date.now()}`,
    description: `Deposito en ${bankAccount.bankName}`,
    category: "Ingreso",
    amount: numAmount,
    currency,
    date: `Hoy, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  });

  return getBankDashboardData(bankAccountId);
}

export async function exchangeBankCurrency(bankAccountId, fromCurrency, toCurrency, amount) {
  const bankAccount = localBankAccounts.find((account) => account.id === bankAccountId);
  const numAmount = parseFloat(amount);

  if (!bankAccount || !numAmount || numAmount <= 0) {
    throw new Error("Monto invalido");
  }

  const fromBalance = findBankBalance(bankAccount, fromCurrency);
  const toBalance = findBankBalance(bankAccount, toCurrency);

  if (fromBalance.balance < numAmount) {
    throw new Error("Saldo insuficiente");
  }

  const rate = getCurrencyRate(fromCurrency, toCurrency);
  const convertedAmount = parseFloat((numAmount * rate).toFixed(2));

  fromBalance.balance = parseFloat((fromBalance.balance - numAmount).toFixed(2));
  toBalance.balance = parseFloat((toBalance.balance + convertedAmount).toFixed(2));

  bankAccount.transactions.unshift({
    id: `bank-tx-${Date.now()}`,
    description: `Conversion ${fromCurrency} a ${toCurrency}`,
    category: "Divisas",
    amount: convertedAmount,
    currency: toCurrency,
    date: `Hoy, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  });

  return getBankDashboardData(bankAccountId);
}

export async function transferBetweenBankAccounts({ fromBankAccountId, toBankAccountId, currency, amount }) {
  const fromBankAccount = localBankAccounts.find((account) => account.id === fromBankAccountId);
  const toBankAccount = localBankAccounts.find((account) => account.id === toBankAccountId);
  const numAmount = parseFloat(amount);

  if (!fromBankAccount || !toBankAccount || !numAmount || numAmount <= 0) {
    throw new Error("Transferencia invalida");
  }

  const fromBalance = findBankBalance(fromBankAccount, currency);
  const toBalance = findBankBalance(toBankAccount, currency);

  if (fromBalance.balance < numAmount) {
    throw new Error("Saldo insuficiente");
  }

  fromBalance.balance = parseFloat((fromBalance.balance - numAmount).toFixed(2));
  toBalance.balance = parseFloat((toBalance.balance + numAmount).toFixed(2));

  fromBankAccount.transactions.unshift({
    id: `bank-tx-${Date.now()}`,
    description: `Transferencia a ${toBankAccount.bankName}`,
    category: "Envio",
    amount: -numAmount,
    currency,
    date: `Hoy, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  });

  toBankAccount.transactions.unshift({
    id: `bank-tx-${Date.now()}-in`,
    description: `Transferencia desde ${fromBankAccount.bankName}`,
    category: "Ingreso",
    amount: numAmount,
    currency,
    date: `Hoy, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  });

  return getBankDashboardData(fromBankAccountId);
}

export async function getDashboardData() {
  return {
    accounts: localAccounts,
    exchangeRates,
    recentTransactions: localTransactions,
    transferContacts: localContacts,
    walletSummary: localWalletSummary,
  };
}

const bankAccountToDashboardAccounts = (bankAccount) =>
  bankAccount.balances.map((balance) => ({
    id: `${bankAccount.id}:${balance.currency}`,
    bankAccountId: bankAccount.id,
    name: balance.currency,
    type: bankAccount.type,
    currency: balance.currency,
    balance: balance.balance,
    cardNumber: bankAccount.cardLast4,
    accent: bankAccount.accent,
    rate: `${bankAccount.bankName} • ${bankAccount.type}`,
  }));

const bankTransactionToDashboardTransaction = (transaction) => ({
  id: transaction.id,
  merchant: transaction.description,
  category: transaction.category,
  amount: transaction.amount,
  currency: transaction.currency,
  date: transaction.date,
});

export async function getDashboardDataForBankAccount(bankAccountId) {
  const bankAccount = localBankAccounts.find((account) => account.id === bankAccountId) || localBankAccounts[0];
  const accountsForBank = bankAccountToDashboardAccounts(bankAccount);

  return {
    accounts: accountsForBank,
    bankAccount: cloneBankAccount(bankAccount),
    bankAccounts: localBankAccounts.map(cloneBankAccount),
    exchangeRates,
    recentTransactions: bankAccount.transactions.map(bankTransactionToDashboardTransaction),
    transferContacts: localBankAccounts
      .filter((account) => account.id !== bankAccount.id)
      .map((account) => ({
        id: account.id,
        name: account.bankName,
        initials: account.bankName.substring(0, 2).toUpperCase(),
        account: `${account.primaryCurrency} ${maskAccountNumber(account.cardLast4)}`,
      })),
    walletSummary: {
      ...localWalletSummary,
      userName: bankAccount.owner,
      totalBalance: getAccountTotalInMxn(bankAccount),
      mainCurrency: bankAccount.primaryCurrency,
    },
  };
}

const parseScopedAccountId = (scopedAccountId) => {
  const [bankAccountId, currency] = String(scopedAccountId).split(":");

  return { bankAccountId, currency };
};

const getAccountTotalInMxn = (bankAccount) =>
  bankAccount.balances.reduce((total, balance) => {
    const rate = getCurrencyRate(balance.currency, "MXN");
    return parseFloat((total + balance.balance * rate).toFixed(2));
  }, 0);

export async function addMoneyToScopedAccount(scopedAccountId, amount) {
  const { bankAccountId, currency } = parseScopedAccountId(scopedAccountId);

  await addMoneyToBankBalance(bankAccountId, currency, amount);
  return getDashboardDataForBankAccount(bankAccountId);
}

export async function exchangeScopedCurrency(fromScopedAccountId, toScopedAccountId, fromAmount) {
  const from = parseScopedAccountId(fromScopedAccountId);
  const to = parseScopedAccountId(toScopedAccountId);

  if (from.bankAccountId !== to.bankAccountId) {
    throw new Error("La conversion debe ser dentro de la misma cuenta bancaria");
  }

  await exchangeBankCurrency(from.bankAccountId, from.currency, to.currency, fromAmount);
  return getDashboardDataForBankAccount(from.bankAccountId);
}

export async function transferFromScopedAccount(scopedAccountId, toBankAccountId, amount) {
  const { bankAccountId, currency } = parseScopedAccountId(scopedAccountId);

  await transferBetweenBankAccounts({
    fromBankAccountId: bankAccountId,
    toBankAccountId,
    currency,
    amount,
  });

  return getDashboardDataForBankAccount(bankAccountId);
}

/**
 * Añade dinero a una cuenta específica (Simulado)
 */
export async function addMoney(accountId, amount) {
  const account = localAccounts.find((a) => a.id === accountId);
  if (account) {
    const numAmount = parseFloat(amount);
    account.balance = parseFloat((account.balance + numAmount).toFixed(2));
    
    // Si es la divisa principal, actualizamos el balance global
    if (account.currency === localWalletSummary.mainCurrency) {
      localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance + numAmount).toFixed(2));
    } else {
      // Si es otra divisa, sumamos su valor aproximado al balance global según tasas de cambio
      const rateObj = exchangeRates.find(r => r.pair.startsWith(account.currency + "/"));
      if (rateObj) {
        const mxnEquivalent = numAmount * rateObj.rate;
        localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance + mxnEquivalent).toFixed(2));
      } else {
        // Fallback básico si no se encuentra par directo
        localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance + numAmount).toFixed(2));
      }
    }

    localTransactions.unshift({
      id: `tx-${Date.now()}`,
      merchant: `Depósito en ${account.name}`,
      category: "Ingreso",
      amount: numAmount,
      currency: account.currency,
      date: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  }
  return getDashboardData();
}

/**
 * Transfiere dinero a un contacto (Simulado)
 */
export async function transferMoney(accountId, contactId, amount) {
  const account = localAccounts.find((a) => a.id === accountId);
  const contact = localContacts.find((c) => c.id === contactId);
  const numAmount = parseFloat(amount);

  if (account && contact) {
    if (account.balance < numAmount) {
      throw new Error("Saldo insuficiente");
    }

    account.balance = parseFloat((account.balance - numAmount).toFixed(2));

    // Si es la divisa principal, restamos del balance total
    if (account.currency === localWalletSummary.mainCurrency) {
      localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance - numAmount).toFixed(2));
    } else {
      const rateObj = exchangeRates.find(r => r.pair.startsWith(account.currency + "/"));
      if (rateObj) {
        const mxnEquivalent = numAmount * rateObj.rate;
        localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance - mxnEquivalent).toFixed(2));
      } else {
        localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance - numAmount).toFixed(2));
      }
    }

    localTransactions.unshift({
      id: `tx-${Date.now()}`,
      merchant: `Transferencia a ${contact.name}`,
      category: "Envio",
      amount: -numAmount,
      currency: account.currency,
      date: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  }
  return getDashboardData();
}

/**
 * Convierte saldo entre divisas (Simulado)
 */
export async function exchangeCurrency(fromAccountId, toAccountId, fromAmount, toAmount) {
  const fromAccount = localAccounts.find((a) => a.id === fromAccountId);
  const toAccount = localAccounts.find((a) => a.id === toAccountId);
  const numFromAmount = parseFloat(fromAmount);
  const numToAmount = parseFloat(toAmount);

  if (fromAccount && toAccount) {
    if (fromAccount.balance < numFromAmount) {
      throw new Error("Saldo insuficiente");
    }

    fromAccount.balance = parseFloat((fromAccount.balance - numFromAmount).toFixed(2));
    toAccount.balance = parseFloat((toAccount.balance + numToAmount).toFixed(2));

    // Ajustamos el total balance considerando las diferencias de cambio si la divisa principal se vio afectada
    if (fromAccount.currency === localWalletSummary.mainCurrency) {
      localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance - numFromAmount).toFixed(2));
    } else {
      const rateObj = exchangeRates.find(r => r.pair.startsWith(fromAccount.currency + "/"));
      if (rateObj) {
        const mxnEquivalent = numFromAmount * rateObj.rate;
        localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance - mxnEquivalent).toFixed(2));
      }
    }

    if (toAccount.currency === localWalletSummary.mainCurrency) {
      localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance + numToAmount).toFixed(2));
    } else {
      const rateObj = exchangeRates.find(r => r.pair.startsWith(toAccount.currency + "/"));
      if (rateObj) {
        const mxnEquivalent = numToAmount * rateObj.rate;
        localWalletSummary.totalBalance = parseFloat((localWalletSummary.totalBalance + mxnEquivalent).toFixed(2));
      }
    }

    localTransactions.unshift({
      id: `tx-${Date.now()}`,
      merchant: `Conversión ${fromAccount.currency} a ${toAccount.currency}`,
      category: "Divisas",
      amount: numToAmount,
      currency: toAccount.currency,
      date: `Hoy, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  }
  return getDashboardData();
}

/**
 * Añade un nuevo contacto a la agenda (Simulado)
 */
export async function addContact(name, initials, account) {
  const newContact = {
    id: `contact-${Date.now()}`,
    name,
    initials: initials || name.substring(0, 2).toUpperCase(),
    account: account || "MXN ••••"
  };
  localContacts.push(newContact);
  return getDashboardData();
}
