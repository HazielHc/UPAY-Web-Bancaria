import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AddCardModal } from "../components/AddCardModal";
import {
  ArrowLeftRight,
  Bell,
  Check,
  Eye,
  EyeOff,
  Home,
  Info,
  LogOut,
  Plus,
  Search,
  Settings,
  Shuffle,
  UserPlus,
  X,
} from "lucide-react";
import { Flag } from "../components/Flag";
import upayLogo from "../assets/upay-logo.svg";
import {
  getAccountById,
  convertAccountCurrency,
  depositToAccount,
} from "../services/accountService";
import { createTransfer } from "../services/transactionService";
import { getRates } from "../services/currencyService";
import { getContacts, addContact as saveContact } from "../services/contactsService";

const SUPPORTED_CURRENCIES = ["MXN", "USD", "EUR", "GBP", "CHF", "JPY"];

const currencyFlagMap = { MXN: "MX", USD: "US", EUR: "EU", GBP: "UK", CHF: "CH", JPY: "JP" };
const currencySymbolMap = { MXN: "$", USD: "US$", EUR: "€", GBP: "£", CHF: "CHF", JPY: "¥" };
const currencyLabelMap = {
  MXN: "Peso mexicano",
  USD: "Dólar estadounidense",
  EUR: "Euro",
  GBP: "Libra esterlina",
  CHF: "Franco suizo",
  JPY: "Yen japonés",
};

const getCurrencyFlag = (currency) => currencyFlagMap[currency] || "";
const getCurrencySymbol = (currency) => currencySymbolMap[currency] || "";
const getCurrencyLabel = (currency) => currencyLabelMap[currency] || currency;

export function Dashboard() {
  const navigate = useNavigate();
  const { accountId } = useParams();

  const [account, setAccount] = useState(null); 
  const [hideBalance, setHideBalance] = useState(false);
  const [rates, setRates] = useState({}); 

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showContactsDrawer, setShowContactsDrawer] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Inputs de modales
  const [amountInput, setAmountInput] = useState("");
  const [sendContactId, setSendContactId] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [targetCurrency, setTargetCurrency] = useState(""); 
  const [newContactName, setNewContactName] = useState("");
  const [newContactAccountId, setNewContactAccountId] = useState("");

  const [contacts, setContacts] = useState([]);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (!accountId) {
      navigate("/profile");
      return;
    }

    getAccountById(accountId)
      .then((acc) => {
        setAccount({
          id: acc.id,
          name: acc.bank_name,
          balance: Number(acc.balance),
          currency: acc.currency,
        });
      })
      .catch((err) => {
        console.error("Error cargando cuenta:", err);
        navigate("/profile");
      });

    setContacts(getContacts());
  }, [accountId, navigate]);

  useEffect(() => {
    if (!account) return;

    const targets = SUPPORTED_CURRENCIES.filter((c) => c !== account.currency);
    getRates(account.currency, targets)
      .then((res) => {
        setRates(res.rates);
        if (!targetCurrency && targets.length > 0) {
          setTargetCurrency(targets[0]);
        }
      })
      .catch((err) => console.error("Error cargando tasas:", err));
  }, [account?.id, account?.currency]);

  if (!account) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0c0a24] text-white">
        <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 font-semibold backdrop-blur-xl">
          Cargando...
        </div>
      </main>
    );
  }

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 4000);
  };

  const refreshAccount = async () => {
    const acc = await getAccountById(account.id);
    setAccount({
      id: acc.id,
      name: acc.bank_name,
      balance: Number(acc.balance),
      currency: acc.currency,
    });
  };

  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) return;
    try {
      await depositToAccount(account.id, amountInput);
      await refreshAccount();
      setShowAddModal(false);
      triggerNotification(`Se añadieron ${account.currency} $${amountInput} con éxito.`);
      setAmountInput("");
    } catch (err) {
      alert(err.message || "Error al depositar");
    }
  };

  const handleSendMoneySubmit = async (e) => {
    e.preventDefault();
    if (!sendAmount || isNaN(sendAmount) || parseFloat(sendAmount) <= 0 || !sendContactId) return;

    const contact = contacts.find((c) => c.id === sendContactId);
    try {
      const result = await createTransfer({
        fromAccountId: account.id,
        toAccountId: contact.accountId,
        amount: sendAmount,
        currency: account.currency,
        description: `Transferencia a ${contact.name}`,
      });

      if (result.status === "failed") {
        alert(`Transferencia rechazada: ${result.reason ?? "motivo desconocido"}`);
        return;
      }

      await refreshAccount();
      setShowSendModal(false);
      setSendAmount("");
      triggerNotification(`Transferencia de $${sendAmount} ${account.currency} enviada a ${contact.name}.`);
    } catch (err) {
      alert(err.message || "Error al realizar transferencia");
    }
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!targetCurrency || targetCurrency === account.currency) return;

    try {
      const result = await convertAccountCurrency(account.id, targetCurrency);
      setAccount((prev) => ({ ...prev, currency: result.currency, balance: Number(result.balance) }));
      setShowExchangeModal(false);
      triggerNotification(`Cuenta convertida a ${result.currency} (tasa aplicada: ${result.rateApplied.toFixed(4)}).`);
    } catch (err) {
      alert(err.message || "Error al convertir la cuenta");
    }
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactAccountId.trim()) return;

    const displayAccount = `Cuenta ${newContactAccountId.slice(0, 8)}...`;
    const updated = saveContact(newContactName, newContactAccountId, displayAccount);
    setContacts(updated);
    setNewContactName("");
    setNewContactAccountId("");
    triggerNotification(`Contacto ${newContactName} agregado.`);
  };

  const handleCardCreated = (newCard) => {
    triggerNotification(`Tarjeta terminación ${newCard?.last4 ?? ""} agregada a ${account.name}.`);
  };

  const formatBalance = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    if (hideBalance) return { symbol: "", integer: "••••••", decimal: "" };
    const parts = Number(amount)
      .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .split(".");
    return { symbol, integer: parts[0], decimal: "." + parts[1] };
  };

  const currentBalance = formatBalance(account.balance, account.currency);
  const otherCurrencies = SUPPORTED_CURRENCIES.filter((c) => c !== account.currency);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0f0d2c] text-white">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-x-0 top-6 z-50 mx-auto flex w-fit items-center gap-3 rounded-full border border-indigo-500/30 bg-[#1f1a4a]/95 px-5 py-3 shadow-2xl backdrop-blur"
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-indigo-500 text-white">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold text-white/90">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 grid min-h-screen overflow-hidden rounded-[28px] border border-white/5 shadow-2xl lg:grid-cols-[250px_1fr]">
        {/* SIDEBAR */}
        <aside className="hidden border-r border-white/5 bg-[#0f0d2c] p-6 lg:flex lg:flex-col justify-between">
          <div className="space-y-8">
            <div className="pl-4">
              <img src={upayLogo} alt="UPAY" className="h-12 w-auto select-none" draggable="false" />
            </div>
            <nav className="space-y-2">
              <button
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-transparent px-4 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
                onClick={() => navigate("/profile")}
                type="button"
              >
                <Home size={18} />
                Mis cuentas
              </button>
              <button
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-transparent px-4 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
                onClick={() => navigate("/profile")}
                type="button"
              >
                <UserPlus size={18} />
                Perfil
              </button>
              <button
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-transparent px-4 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
                type="button"
                onClick={() => {
                  if (contacts.length > 0) setSendContactId(contacts[0].id);
                  setShowSendModal(true);
                }}
              >
                <ArrowLeftRight size={18} />
                Transferir
              </button>
              <button
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-transparent px-4 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
                type="button"
                onClick={() => setShowContactsDrawer(true)}
              >
                <UserPlus size={18} />
                Contactos
              </button>
            </nav>
          </div>

          <div className="space-y-4">
            <button
              className="flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              type="button"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* CUERPO CENTRAL */}
        <section className="flex flex-col min-w-0 p-6 lg:p-8 space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex h-12 w-full max-w-[380px] items-center gap-3 rounded-full bg-[#1e1a44] px-5 text-sm ring-1 ring-white/5">
              <Search size={18} className="text-white/40" />
              <input
                className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
                placeholder="Buscar"
                type="search"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                className="relative grid size-12 place-items-center rounded-full bg-[#1e1a44] border border-white/5 text-white/80 transition hover:bg-[#282258]"
                type="button"
                onClick={() => triggerNotification("No tienes notificaciones pendientes.")}
              >
                <Bell size={20} />
                <span className="absolute right-3.5 top-3.5 size-2 rounded-full bg-rose-500" />
              </button>
              <button
                className="grid size-12 place-items-center rounded-full bg-[#1e1a44] border border-white/5 text-white/80 transition hover:bg-[#282258]"
                type="button"
                onClick={() => triggerNotification("Ajustes cargados.")}
              >
                <Settings size={20} />
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500"
                type="button"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                <span>Añadir dinero</span>
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500"
                onClick={() => setShowAddCardModal(true)}
                type="button"
              >
                <Plus size={18} />
                <span>Agregar tarjeta</span>
              </button>
            </div>
          </header>

          {/* TARJETA DE BALANCE */}
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#403585] via-[#2c235a] to-[#120d29] border border-white/10 shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(139,125,255,0.4),transparent_45%)]" />
            <div className="absolute -right-20 -top-20 h-[320px] w-[600px] rotate-[-12deg] rounded-[40%] bg-gradient-to-r from-indigo-500/10 via-purple-500/20 to-transparent blur-2xl" />

            <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-6 text-center w-full flex-grow">
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/10">
                <span className="capitalize">{account.name}</span>
                <button type="button" onClick={() => setHideBalance(!hideBalance)} className="text-white/50 hover:text-white">
                  {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              <div className="mt-6 flex items-start justify-center font-display font-black tracking-tight text-white select-none">
                <span className="mt-2 text-4xl sm:text-6xl self-start font-medium opacity-80 mr-1">
                  {currentBalance.symbol}
                </span>
                <span className="text-6xl sm:text-8xl leading-none font-bold">{currentBalance.integer}</span>
                {!hideBalance && (
                  <span className="mt-2 text-2xl sm:text-4xl self-start opacity-70 font-medium">
                    {currentBalance.decimal}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/50">
                <span>{getCurrencyLabel(account.currency)}</span>
                <Info size={14} className="opacity-80" />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-8 rounded-3xl bg-black/20 p-4 border border-white/5 backdrop-blur-md w-full max-w-[480px]">
                <button
                  className="flex flex-col items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition group"
                  type="button"
                  onClick={() => setShowAddModal(true)}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
                    <Plus size={22} />
                  </span>
                  Añadir dinero
                </button>

                <button
                  className="flex flex-col items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition group"
                  type="button"
                  onClick={() => {
                    if (contacts.length > 0) setSendContactId(contacts[0].id);
                    setShowSendModal(true);
                  }}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-white/10 text-white border border-white/10 group-hover:bg-white/20 transition">
                    <ArrowLeftRight size={20} />
                  </span>
                  Mover
                </button>

                <button
                  className="flex flex-col items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition group"
                  type="button"
                  onClick={() => setShowExchangeModal(true)}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-white/10 text-white border border-white/10 group-hover:bg-white/20 transition">
                    <Shuffle size={20} />
                  </span>
                  Convertir
                </button>
              </div>
            </div>

            {/* TASAS DE CAMBIO */}
            <div className="bg-[#0f0d2c]/90 border-t border-white/5 p-5 backdrop-blur-md w-full relative z-10">
              <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                <span>Si convirtieras ahora</span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-1">
                {otherCurrencies.map((cur) => {
                  const rate = rates[cur];
                  const hypotheticalAmount = rate ? account.balance * rate : null;
                  const symbol = getCurrencySymbol(cur);

                  return (
                    <button
                      key={cur}
                      onClick={() => {
                        setTargetCurrency(cur);
                        setShowExchangeModal(true);
                      }}
                      className="flex min-w-[170px] items-center gap-3 rounded-2xl p-2.5 transition border border-transparent bg-white/5 hover:bg-white/10 text-left"
                      type="button"
                    >
                      <Flag countryCode={getCurrencyFlag(cur)} className="size-10 rounded-full overflow-hidden border border-white/10" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white/50">{getCurrencyLabel(cur)}</p>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {hypotheticalAmount != null
                            ? `${symbol}${hypotheticalAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                            : "..."}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        </section>
      </div>

      {/* MODAL: Añadir dinero */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#171439] p-6 shadow-2xl">
              <button className="absolute right-4 top-4 text-white/50 hover:text-white" onClick={() => setShowAddModal(false)} type="button">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-white">Añadir dinero</h2>
              <p className="mt-1 text-xs text-white/50">Deposita fondos en {account.name} ({account.currency}).</p>
              <form className="mt-6 space-y-4" onSubmit={handleAddMoneySubmit}>
                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Monto a añadir</span>
                  <input
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="Monto (ej. 1500)"
                    type="number"
                    step="any"
                    required
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-indigo-500 text-white placeholder:text-white/20"
                  />
                </label>
                <button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                  Depositar fondos
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Transferir */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSendModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#171439] p-6 shadow-2xl">
              <button className="absolute right-4 top-4 text-white/50 hover:text-white" onClick={() => setShowSendModal(false)} type="button">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-white">Transferir fondos</h2>
              <p className="mt-1 text-xs text-white/50">Envía dinero desde {account.name} a un contacto.</p>
              <form className="mt-6 space-y-4" onSubmit={handleSendMoneySubmit}>
                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Cuenta de origen</span>
                  <div className="flex h-12 items-center rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white">
                    {account.name} ({account.currency}) - Saldo: ${account.balance}
                  </div>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Seleccionar contacto</span>
                  <select
                    value={sendContactId}
                    onChange={(e) => setSendContactId(e.target.value)}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-indigo-500 text-white"
                  >
                    {contacts.length === 0 && <option value="">Sin contactos — agrega uno primero</option>}
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#171439] text-white">
                        {c.name} ({c.account})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Monto a transferir</span>
                  <input
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="Monto a enviar"
                    type="number"
                    step="any"
                    required
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-indigo-500 text-white placeholder:text-white/20"
                  />
                </label>
                <button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                  Enviar transferencia
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Convertir monto */}
      <AnimatePresence>
        {showExchangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExchangeModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0e0e1c] p-6 shadow-2xl">
              <button className="absolute right-4 top-4 text-white/40 hover:text-white transition" onClick={() => setShowExchangeModal(false)} type="button">
                <X size={18} />
              </button>
              <h2 className="text-lg font-bold text-white text-left tracking-tight">Convertir cuenta completa</h2>
              <p className="mt-1 text-[11px] text-white/50 text-left">
                Esta cuenta cambiará por completo de {account.currency} a la moneda que elijas. Tasa en tiempo real.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handleConvertSubmit}>
                <div className="space-y-1.5 text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-white/40">CONVERTIR A</span>
                  <select
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                    className="w-full h-11 rounded-xl bg-[#13112c] border border-white/10 px-3 text-xs font-bold text-white outline-none focus:border-indigo-500/50"
                  >
                    {otherCurrencies.map((cur) => (
                      <option key={cur} value={cur} className="bg-[#171439]">
                        {getCurrencyLabel(cur)} ({cur})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex h-16 items-center justify-between rounded-xl border border-white/5 bg-[#13112c] px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Flag countryCode={getCurrencyFlag(account.currency)} className="size-8 rounded-full border border-white/10" />
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Ahora tienes</span>
                      <p className="text-xs font-bold text-white leading-tight mt-0.5">
                        {getCurrencySymbol(account.currency)}{account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} {account.currency}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex h-16 items-center justify-between rounded-xl border border-white/5 bg-[#13112c] px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Flag countryCode={getCurrencyFlag(targetCurrency)} className="size-8 rounded-full border border-white/10" />
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Recibirás (aprox.)</span>
                      <p className="text-xs font-bold text-white leading-tight mt-0.5">
                        {rates[targetCurrency]
                          ? `${getCurrencySymbol(targetCurrency)}${(account.balance * rates[targetCurrency]).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
                          : "..."} {targetCurrency}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-[#181335]/65 border border-indigo-500/10 p-3 text-left">
                  <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                  <span className="text-[10px] text-indigo-200">
                    La tasa final se calcula en el momento de confirmar, puede variar ligeramente respecto a esta previsualización.
                  </span>
                </div>

                <button type="submit" className="w-full h-12 rounded-xl bg-[#593fd7] hover:bg-[#4a34bd] transition font-bold text-white text-xs tracking-wide shadow-xl shadow-indigo-600/10">
                  Confirmar conversión
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER: Contactos */}
      <AnimatePresence>
        {showContactsDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContactsDrawer(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: 280 }} animate={{ x: 0 }} exit={{ x: 280 }} className="relative z-10 w-full max-w-sm h-full bg-[#0f0d2c] border-l border-white/5 p-6 shadow-2xl flex flex-col">
              <button className="absolute right-4 top-4 text-white/50 hover:text-white" onClick={() => setShowContactsDrawer(false)} type="button">
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-white mt-4">Contactos bancarios</h2>
              <p className="text-xs text-white/50 mt-1">Guardados solo en este dispositivo.</p>

              <form className="mt-6 space-y-2" onSubmit={handleAddContactSubmit}>
                <input
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Nombre de contacto"
                  required
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-xs outline-none focus:border-indigo-500 text-white"
                />
                <input
                  value={newContactAccountId}
                  onChange={(e) => setNewContactAccountId(e.target.value)}
                  placeholder="ID de cuenta destino"
                  required
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-xs outline-none focus:border-indigo-500 text-white"
                />
                <button type="submit" className="w-full h-10 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500">
                  Añadir contacto
                </button>
              </form>

              <div className="mt-8 flex-1 overflow-y-auto space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold">
                        {contact.initials}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{contact.name}</p>
                        <p className="text-2xs text-white/40">{contact.account}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSendContactId(contact.id);
                        setShowContactsDrawer(false);
                        setShowSendModal(true);
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                    >
                      Enviar
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Agregar tarjeta */}
      <AddCardModal
        accountId={account.id}
        bankName={account.name}
        isOpen={showAddCardModal}
        onCardCreated={handleCardCreated}
        onClose={() => setShowAddCardModal(false)}
      />
    </main>
  );
}
