import {
  accounts,
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

export async function getDashboardData() {
  return {
    accounts: localAccounts,
    exchangeRates,
    recentTransactions: localTransactions,
    transferContacts: localContacts,
    walletSummary: localWalletSummary,
  };
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
