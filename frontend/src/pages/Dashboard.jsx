import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {   //se importan los iconos de lucide-react
  ArrowLeftRight,
  Bell,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Home, 
  Info,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldPlus,
  Shuffle,
  UserPlus,
  X,
} from "lucide-react";
import { Flag } from "../components/Flag";
import upayLogo from "../assets/upay-logo.svg";
import {
  getDashboardData,
  addMoneyToScopedAccount,
  exchangeScopedCurrency,
  getDashboardDataForBankAccount,
  transferFromScopedAccount,
  addContact,
} from "../services/dashboardService";

// Helper para dibujar líneas de tendencia (Sparklines) mediante SVG
function Sparkline({ data, color = "#8b7dff", width = 80, height = 24 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  return (
    <svg width={width} height={height} className="overflow-visible opacity-70">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const currencyFlagMap = {
  MXN: "MX",
  USD: "US",
  EUR: "EU",
  GBP: "UK",
  CHF: "CH",
  JPY: "JP",
};

const currencySymbolMap = {
  MXN: "$",
  USD: "US$",
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
  JPY: "¥",
};

const currencyLabelMap = {
  MXN: "MXN Peso",
  USD: "USD Dolar",
  EUR: "EUR Euro",
  GBP: "GBP Libra",
  CHF: "CHF Franco",
  JPY: "JPY Yen",
};

const currencyOptionLabelById = {
  "mxn-remunerada": "Peso mexicano (MXN)",
  "mxn-main": "Peso (MXN)",
  "usd-travel": "Dolar (USD)",
  "eur-savings": "Euro (EUR)",
  "gbp-pound": "Libra (GBP)",
  "chf-franc": "Franco (CHF)",
  "jpy-yen": "Yen (JPY)",
};

const getCurrencyFlag = (currency) => currencyFlagMap[currency] || "";
const getCurrencySymbol = (currency) => currencySymbolMap[currency] || "";
const getCurrencyLabel = (account) => currencyLabelMap[account?.currency] || account?.name || "";
const getCurrencyOptionLabel = (account) => currencyOptionLabelById[account.id] || `${account.name} (${account.currency})`;
const maskAccountNumber = (last4) => `.........${String(last4).slice(-4)}`;

export function Dashboard() {
  const navigate = useNavigate();
  const { accountId: bankAccountId } = useParams();
  const [data, setData] = useState(null);
  const [activeAccountId, setActiveAccountId] = useState("");
  const [hideBalance, setHideBalance] = useState(false);

  // Estados de control para Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showContactsDrawer, setShowContactsDrawer] = useState(false);

  // Estados de inputs para Modales
  const [amountInput, setAmountInput] = useState("");
  const [selectedDestAccountId, setSelectedDestAccountId] = useState("");
  const [sendContactId, setSendContactId] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [exchangeFromId, setExchangeFromId] = useState("");
  const [exchangeToId, setExchangeToId] = useState("");
  const [exchangeFromAmount, setExchangeFromAmount] = useState("");
  const [newContactName, setNewContactName] = useState("");

  const [notification, setNotification] = useState("");

  // Carga inicial de datos mock
  useEffect(() => {
    const dataLoader = bankAccountId ? getDashboardDataForBankAccount(bankAccountId) : getDashboardData();

    dataLoader.then((res) => {
      setData(res);
      if (res.accounts.length > 0) {
        setActiveAccountId(res.accounts[0].id);
        setSelectedDestAccountId(res.accounts[0].id);
        setExchangeFromId(res.accounts[0].id);
        setExchangeToId(res.accounts[1]?.id || res.accounts[0].id);
      }
    });
  }, [bankAccountId]);

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0c0a24] text-white">
        <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 font-semibold backdrop-blur-xl">
          Cargando...
        </div>
      </main>
    );
  }

  // Cuenta activa actualmente seleccionada
  const activeAccount = data.accounts.find((a) => a.id === activeAccountId) || data.accounts[0];

  // Helper para mostrar notificaciones flotantes de éxito
  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  // Acciones: Añadir dinero (Submit)
  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) return;
    try {
      const updatedData = await addMoneyToScopedAccount(selectedDestAccountId, amountInput);
      setData(updatedData);
      setShowAddModal(false);
      setAmountInput("");
      const targetAcc = updatedData.accounts.find((a) => a.id === selectedDestAccountId);
      triggerNotification(`Se añadieron ${targetAcc.currency} $${amountInput} con éxito.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Acciones: Enviar dinero (Submit)
  const handleSendMoneySubmit = async (e) => {
    e.preventDefault();
    if (!sendAmount || isNaN(sendAmount) || parseFloat(sendAmount) <= 0 || !sendContactId) return;
    try {
      const updatedData = await transferFromScopedAccount(activeAccountId, sendContactId, sendAmount);
      setData(updatedData);
      setShowSendModal(false);
      setSendAmount("");
      const targetContact = data.transferContacts.find((c) => c.id === sendContactId);
      triggerNotification(`Transferencia de $${sendAmount} ${activeAccount.currency} enviada a ${targetContact.name}.`);
    } catch (err) {
      alert(err.message || "Error al realizar transferencia");
    }
  };

  // Acciones: Convertir divisas (Submit)
  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    if (!exchangeFromAmount || isNaN(exchangeFromAmount) || parseFloat(exchangeFromAmount) <= 0) return;
    
    const fromAcc = data.accounts.find((a) => a.id === exchangeFromId);
    const toAcc = data.accounts.find((a) => a.id === exchangeToId);

    // Calcular el monto equivalente
    let rate = 1;
    if (fromAcc.currency !== toAcc.currency) {
      // Buscar tasa de conversión directa o inversa
      const pairDirect = `${fromAcc.currency}/${toAcc.currency}`;
      const pairInverse = `${toAcc.currency}/${fromAcc.currency}`;
      const rateObjDirect = data.exchangeRates.find((r) => r.pair === pairDirect);
      const rateObjInverse = data.exchangeRates.find((r) => r.pair === pairInverse);

      if (rateObjDirect) {
        rate = rateObjDirect.rate;
      } else if (rateObjInverse) {
        rate = 1 / rateObjInverse.rate;
      } else {
        // Fallback genérico usando MXN como puente si no hay par directo
        const fromToMxn = data.exchangeRates.find((r) => r.pair === `${fromAcc.currency}/MXN`)?.rate || 1;
        const toToMxn = data.exchangeRates.find((r) => r.pair === `${toAcc.currency}/MXN`)?.rate || 1;
        rate = fromToMxn / toToMxn;
      }
    }

    const calculatedToAmount = parseFloat((parseFloat(exchangeFromAmount) * rate).toFixed(2));

    try {
      const updatedData = await exchangeScopedCurrency(exchangeFromId, exchangeToId, exchangeFromAmount);
      setData(updatedData);
      setShowExchangeModal(false);
      setExchangeFromAmount("");
      triggerNotification(`Conversión de $${exchangeFromAmount} ${fromAcc.currency} a $${calculatedToAmount} ${toAcc.currency} realizada.`);
    } catch (err) {
      alert(err.message || "Error al realizar conversión");
    }
  };

  // Intercambiar divisas origen/destino
  const handleSwap = () => {
    const temp = exchangeFromId;
    setExchangeFromId(exchangeToId);
    setExchangeToId(temp);
  };

  // Registrar nuevo contacto
  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    const initials = newContactName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    const mockAccount = `${activeAccount.currency} ${maskAccountNumber(Math.floor(1000 + Math.random() * 9000))}`;
    const updatedData = await addContact(newContactName, initials, mockAccount);
    setData(updatedData);
    setNewContactName("");
    triggerNotification(`Contacto ${newContactName} agregado.`);
  };

  // Formateador de saldos
  const formatBalance = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    
    if (hideBalance) return "••••••";
    
    // Separador de enteros y decimales para la estética del mockup
    const parts = Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(".");
    return {
      symbol,
      integer: parts[0],
      decimal: "." + parts[1],
    };
  };

  const currentBalance = formatBalance(activeAccount.balance, activeAccount.currency);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0f0d2c] text-white">
      {/* Notificación Flotante */}
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
        
        {/* ================================= SIDEBAR LATERAL ================================= */}
        <aside className="hidden border-r border-white/5 bg-[#0f0d2c] p-6 lg:flex lg:flex-col justify-between">
          <div className="space-y-8">
            {/* Logo UPAY */}
            <div className="pl-4">
              <img
                src={upayLogo}
                alt="UPAY"
                className="h-12 w-auto select-none"
                draggable="false"
              />
            </div>

            {/* Navegación */}
            <nav className="space-y-2">
              <button
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-transparent px-4 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
                onClick={() => navigate("/")}
                type="button"
              >
                <Home size={18} />
                Inicio
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
                  if (data.transferContacts.length > 0) {
                    setSendContactId(data.transferContacts[0].id);
                  }
                  setShowSendModal(true);
                }}
              >
                <ArrowLeftRight size={18} />
                Transferir
              </button>
              
            </nav>
          </div>

          <div className="space-y-4">
            
            

            {/* Cerrar Sesión */}
            <Link
              className="flex h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
              onClick={() => localStorage.removeItem("token")}
              to="/login"
            >
              <LogOut size={16} />
              Cerrar sesión
            </Link>
          </div>
        </aside>

        {/* ================================= CUERPO CENTRAL ================================= */}
        <section className="flex flex-col min-w-0 p-6 lg:p-8 space-y-6">
          
          {/* HEADER SUPERIOR */}
          <header className="flex flex-wrap items-center justify-between gap-4">
            {/* Buscador */}
            <div className="relative flex h-12 w-full max-w-[380px] items-center gap-3 rounded-full bg-[#1e1a44] px-5 text-sm ring-1 ring-white/5 transition focus-within:ring-indigo-500/40">
              <Search size={18} className="text-white/40" />
              <input
                className="w-full bg-transparent text-white outline-none placeholder:text-white/30"
                placeholder="Buscar"
                type="search"
                value={exchangeFromAmount}
                onChange={(e) => setExchangeFromAmount(e.target.value)}
              />
            </div>

            {/* Acciones Rápidas Superior */}
            <div className="ml-auto flex items-center gap-3">
              <button
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/5 bg-[#1e1a44] px-4 text-sm font-bold text-white/75 transition hover:bg-[#282258] hover:text-white lg:hidden"
                onClick={() => navigate("/profile")}
                type="button"
              >
                <UserPlus size={18} />
                Perfil
              </button>

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
                onClick={() => triggerNotification("Ajustes del perfil cargados.")}
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
            </div>
          </header>

          {/* TARJETA DE BALANCE CENTRAL */}
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#403585] via-[#2c235a] to-[#120d29] border border-white/10 shadow-2xl flex flex-col justify-between"
            initial={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Efectos de flujo de luz y texturas fluidas */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(139,125,255,0.4),transparent_45%)]" />
            <div className="absolute -right-20 -top-20 h-[320px] w-[600px] rotate-[-12deg] rounded-[40%] bg-gradient-to-r from-indigo-500/10 via-purple-500/20 to-transparent blur-2xl" />

            <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 pb-6 text-center w-full flex-grow">
              {/* Selector de cuenta activa */}
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/10">
                <span className="capitalize">{activeAccount.name}</span>
                <button
                  type="button"
                  onClick={() => setHideBalance(!hideBalance)}
                  className="text-white/50 hover:text-white"
                >
                  {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              {/* Balance */}
              <div className="mt-6 flex items-start justify-center font-display font-black tracking-tight text-white select-none">
                <span className="mt-2 text-4xl sm:text-6xl self-start font-medium opacity-80 mr-1">
                  {hideBalance ? "" : currentBalance.symbol}
                </span>
                <span className="text-6xl sm:text-8xl leading-none font-bold">
                  {hideBalance ? "••••••" : currentBalance.integer}
                </span>
                {!hideBalance && (
                  <span className="mt-2 text-2xl sm:text-4xl self-start opacity-70 font-medium">  
                    {currentBalance.decimal}
                  </span>
                )}
              </div>

              {/* Tasa fija/Detalle */}
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/50">
                <span>{activeAccount.rate || "Detalle de la cuenta"}</span>
                <Info size={14} className="opacity-80" />
              </div>

              {/* Acciones principales */}
              <div className="mt-8 grid grid-cols-3 gap-8 rounded-3xl bg-black/20 p-4 border border-white/5 backdrop-blur-md w-full max-w-[480px]">
                <button
                  className="flex flex-col items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition group"
                  type="button"
                  onClick={() => {
                    setSelectedDestAccountId(activeAccountId);
                    setShowAddModal(true);
                  }}
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
                    if (data.transferContacts.length > 0) {
                      setSendContactId(data.transferContacts[0].id);
                    }
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
                  onClick={() => {
                    setExchangeFromId(activeAccountId);
                    // Seleccionar otra cuenta por defecto
                    const other = data.accounts.find(a => a.id !== activeAccountId);
                    if (other) setExchangeToId(other.id);
                    setShowExchangeModal(true);
                  }}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-white/10 text-white border border-white/10 group-hover:bg-white/20 transition">
                    <Shuffle size={20} />
                  </span>
                  Convertir
                </button>
              </div>
            </div>

            {/* SECCIÓN DE DIVISAS (BOTTOM DEL CARD) */}
            <div className="bg-[#0f0d2c]/90 border-t border-white/5 p-5 backdrop-blur-md w-full relative z-10">
              <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                <span>Divisas</span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {/* Cuenta Remunerada / Principal */}
                {data.accounts
                  .filter((acc) => acc.id !== "mxn-remunerada")
                  .map((acc) => {
                    const isSelected = activeAccountId === acc.id;
                    const bal = formatBalance(acc.balance, acc.currency);
                    const displayBal = hideBalance 
                      ? "••••" 
                      : acc.balance % 1 === 0 
                      ? `${bal.symbol}${bal.integer}` 
                      : `${bal.symbol}${bal.integer}${bal.decimal}`;

                    return (
                      <button
                        key={acc.id}
                        onClick={() => setActiveAccountId(acc.id)}
                        className={`flex min-w-[170px] items-center gap-3 rounded-2xl p-2.5 transition border text-left ${
                          isSelected
                            ? "bg-white/10 border-white/10 shadow-lg"
                            : "bg-white/5 border-transparent hover:bg-white/10"
                        }`}
                        type="button"
                      >
                        <div className="relative">
                          <Flag countryCode={getCurrencyFlag(acc.currency)} className="size-10 rounded-full overflow-hidden border border-white/10" />
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full bg-white text-[9px] text-[#0f0d2c] font-black shadow-lg">
                              <Check size={10} strokeWidth={4} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-white/50">{acc.name}</p>
                          <p className="text-sm font-bold text-white mt-0.5">{displayBal}</p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.section>

          

        </section>
      </div>

      {/* ================================= CONTROL DE MODALES ================================= */}

      {/* 1. Modal: Añadir Dinero */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#171439] p-6 shadow-2xl"
            >
              <button
                className="absolute right-4 top-4 text-white/50 hover:text-white"
                onClick={() => setShowAddModal(false)}
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-white">Añadir dinero</h2>
              <p className="mt-1 text-xs text-white/50">Simula depósitos bancarios de fondos directamente a tus carteras.</p>

              <form className="mt-6 space-y-4" onSubmit={handleAddMoneySubmit}>
                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Seleccionar cartera</span>
                  <select
                    value={selectedDestAccountId}
                    onChange={(e) => setSelectedDestAccountId(e.target.value)}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-indigo-500 text-white"
                  >
                    {data.accounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="bg-[#171439] text-white">
                        {acc.name} ({acc.currency}) - Saldo: ${acc.balance}
                      </option>
                    ))}
                  </select>
                </label>

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

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                  Depositar fondos
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal: Transferir / Mover */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSendModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#171439] p-6 shadow-2xl"
            >
              <button
                className="absolute right-4 top-4 text-white/50 hover:text-white"
                onClick={() => setShowSendModal(false)}
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-white">Transferir fondos</h2>
              <p className="mt-1 text-xs text-white/50">Envía dinero simulado de forma rápida a tus contactos agregados.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSendMoneySubmit}>
                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Cartera de origen</span>
                  <div className="flex h-12 items-center rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white">
                    {activeAccount.name} ({activeAccount.currency}) - Saldo: ${activeAccount.balance}
                  </div>
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold text-white/50 mb-2">Seleccionar contacto</span>
                  <select
                    value={sendContactId}
                    onChange={(e) => setSendContactId(e.target.value)}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-indigo-500 text-white"
                  >
                    {data.transferContacts.map((c) => (
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
                    max={activeAccount.balance}
                    required
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-sm outline-none focus:border-indigo-500 text-white placeholder:text-white/20"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
                >
                  Enviar transferencia
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Modal: Convertir Divisas */}
      <AnimatePresence>
        {showExchangeModal && (() => {
          const fromAcc = data.accounts.find((a) => a.id === exchangeFromId);
          const toAcc = data.accounts.find((a) => a.id === exchangeToId);

          let rate = 1;
          let reverseRate = 1;

          if (fromAcc && toAcc && fromAcc.currency !== toAcc.currency) {
            const pairDirect = `${fromAcc.currency}/${toAcc.currency}`;
            const pairInverse = `${toAcc.currency}/${fromAcc.currency}`;
            const rateObjDirect = data.exchangeRates.find((r) => r.pair === pairDirect);
            const rateObjInverse = data.exchangeRates.find((r) => r.pair === pairInverse);

            if (rateObjDirect) {
              rate = rateObjDirect.rate;
              reverseRate = 1 / rate;
            } else if (rateObjInverse) {
              rate = 1 / rateObjInverse.rate;
              reverseRate = rateObjInverse.rate;
            } else {
              const fromToMxn = data.exchangeRates.find((r) => r.pair === `${fromAcc.currency}/MXN`)?.rate || 1;
              const toToMxn = data.exchangeRates.find((r) => r.pair === `${toAcc.currency}/MXN`)?.rate || 1;
              rate = fromToMxn / toToMxn;
              reverseRate = 1 / rate;
            }
          }

          const numFromAmount = parseFloat(exchangeFromAmount) || 0;
          const calculatedToAmount = parseFloat((numFromAmount * rate).toFixed(2));
          
          const fromSymbol = getCurrencySymbol(fromAcc?.currency);
          const toSymbol = getCurrencySymbol(toAcc?.currency);
          
          const displayFromBalance = fromAcc ? fromAcc.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
          const displayToBalance = toAcc ? toAcc.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
          const displayToAmount = calculatedToAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          const rateText = fromAcc && toAcc && fromAcc.currency !== toAcc.currency
            ? `1 ${fromAcc.currency} = ${rate.toFixed(4)} ${toAcc.currency} • 1 ${toAcc.currency} = ${reverseRate.toFixed(4)} ${fromAcc.currency}`
            : `1 ${fromAcc?.currency || ""} = 1.0000 ${toAcc?.currency || ""}`;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowExchangeModal(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#0e0e1c] p-6 shadow-2xl"
              >
                {/* Botón de cierre */}
                <button
                  className="absolute right-4 top-4 text-white/40 hover:text-white transition"
                  onClick={() => setShowExchangeModal(false)}
                  type="button"
                >
                  <X size={18} />
                </button>

                <h2 className="text-lg font-bold text-white text-left tracking-tight">Cambiar y Mover Divisas</h2>
                <p className="mt-1 text-[11px] text-white/50 text-left">Tasas de cambio actualizadas en tiempo real</p>

                <form className="mt-5 space-y-4" onSubmit={handleExchangeSubmit}>
                  {/* Selector de divisa objetivo */}
                  <div className="space-y-1.5 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-white/40">SELECCIONAR DIVISA</span>
                    <div className="relative">
                      <select
                        value={exchangeToId}
                        onChange={(e) => {
                          const targetId = e.target.value;
                          setExchangeToId(targetId);
                          if (exchangeFromId === targetId) {
                            const other = data.accounts.find((a) => a.id !== targetId);
                            if (other) setExchangeFromId(other.id);
                          }
                        }}
                        className="w-full h-11 rounded-xl bg-[#13112c] border border-white/10 px-3 pr-8 text-xs font-bold text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                      >
                        {data.accounts.map((acc) => (
                          <option key={acc.id} value={acc.id} className="bg-[#171439] text-white">
                            {getCurrencyOptionLabel(acc)}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/40">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Cajas De y A */}
                  <div className="space-y-1 relative">
                    {/* Caja origen (De) */}
                    <div className="flex h-16 items-center justify-between rounded-xl border border-white/5 bg-[#13112c] px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Flag countryCode={getCurrencyFlag(fromAcc?.currency)} className="size-8 rounded-full border border-white/10" />
                        <div className="text-left flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">De</span>
                          <span className="text-xs font-bold text-white leading-tight mt-0.5">{getCurrencyLabel(fromAcc)}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="text-[9px] font-semibold text-white/40">Saldo disponible</span>
                        <span className="text-xs font-bold text-white mt-0.5">{fromSymbol}{displayFromBalance}</span>
                      </div>
                    </div>

                    {/* Botón de Swap (Flechas arriba/abajo en círculo morado) */}
                    <div className="relative -my-3 z-10 flex justify-center">
                      <button
                        type="button"
                        onClick={handleSwap}
                        className="grid size-8 place-items-center rounded-full bg-[#3d3886] border border-[#161332] text-white hover:bg-indigo-600 transition shadow-md shadow-black/35 active:scale-95 cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.5 2.5V13.5M4.5 13.5L2 11M4.5 13.5L7 11M11.5 13.5V2.5M11.5 2.5L9 5M11.5 2.5L14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Caja destino (A) */}
                    <div className="flex h-16 items-center justify-between rounded-xl border border-white/5 bg-[#13112c] px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Flag countryCode={getCurrencyFlag(toAcc?.currency)} className="size-8 rounded-full border border-white/10" />
                        <div className="text-left flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">A</span>
                          <span className="text-xs font-bold text-white leading-tight mt-0.5">{getCurrencyLabel(toAcc)}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                        <span className="text-[9px] font-semibold text-white/40">Saldo disponible</span>
                        <span className="text-xs font-bold text-white mt-0.5">{toSymbol}{displayToBalance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cantidad a vender */}
                  <div className="space-y-1.5 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-white/40">CANTIDAD A VENDER</span>
                    <div className="relative flex h-12 w-full items-center rounded-xl bg-[#13112c] border border-white/5 px-4 focus-within:border-indigo-500/50">
                      <span className="text-sm font-bold text-white mr-1.5">{fromSymbol}</span>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={exchangeFromAmount}
                        onChange={(e) => setExchangeFromAmount(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Banner de tasa informativa */}
                  <div className="flex items-start gap-2.5 rounded-xl bg-[#181335]/65 border border-indigo-500/10 p-3 text-left">
                    <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-indigo-200">
                      <strong className="text-[#8b7dff] mr-1 font-bold">Tasa de cambio aproximada:</strong>
                      {rateText}
                    </span>
                  </div>

                  {/* Total Recibirás */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs font-bold text-white/50">Recibirás:</span>
                    <span className="text-lg font-black text-white">{toSymbol}{displayToAmount}</span>
                  </div>

                  {/* Confirmar transacción */}
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-[#593fd7] hover:bg-[#4a34bd] transition font-bold text-white text-xs tracking-wide shadow-xl shadow-indigo-600/10 cursor-pointer"
                  >
                    Confirmar transacción
                  </button>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 4. Drawer/Modal Lateral: Contactos e Invitaciones */}
      <AnimatePresence>
        {showContactsDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactsDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              className="relative z-10 w-full max-w-sm h-full bg-[#0f0d2c] border-l border-white/5 p-6 shadow-2xl flex flex-col"
            >
              <button
                className="absolute right-4 top-4 text-white/50 hover:text-white"
                onClick={() => setShowContactsDrawer(false)}
                type="button"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold text-white mt-4">Contactos bancarios</h2>
              <p className="text-xs text-white/50 mt-1">Lista de destinatarios agregados en tu agenda de pagos.</p>

              {/* Formulario rápido para agregar contactos */}
              <form className="mt-6 flex gap-2" onSubmit={handleAddContactSubmit}>
                <input
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Nombre de contacto"
                  required
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-xs outline-none focus:border-indigo-500 text-white"
                />
                <button type="submit" className="h-10 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-500">
                  Añadir
                </button>
              </form>

              {/* Lista de contactos */}
              <div className="mt-8 flex-1 overflow-y-auto space-y-4">
                {data.transferContacts.map((contact) => (
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

    </main>
  );
}

