import React, { useEffect, useState } from "react";
import { getAllUserCards } from "../services/accountService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  Plus,
  Search,
  Settings,
  Check,
  UserPlus,
} from "lucide-react";
import { getProfile } from "../services/authService";
import { getDashboardData } from "../services/dashboardService";
import { Flag } from "../components/Flag";
import { AddAccountModal } from "../components/AddAccountModal";
import upayLogo from "../assets/upay-logo.svg";

const BANK_ACCENT_MAP = {
  bbva: "bg-gradient-to-br from-[#004481] via-[#002f5a] to-[#001c36] text-white",
  banorte: "bg-gradient-to-br from-[#eb1c24] via-[#a30b10] to-[#690306] text-white",
  santander: "bg-gradient-to-br from-[#ec0000] via-[#a30000] to-[#5c0000] text-white",
  banamex: "bg-gradient-to-br from-[#00954c] via-[#00753c] to-[#003d1f] text-white",
  hsbc: "bg-gradient-to-br from-[#db0011] via-[#990009] to-[#4d0004] text-white",
  nu: "bg-gradient-to-br from-[#820ad1] via-[#5c0a97] to-[#2e0550] text-white",
};

const DEFAULT_CARD_ACCENT = "bg-gradient-to-br from-[#3a3170] via-[#252047] to-[#14112b] text-white";

const getBankAccent = (bankName) => {
  if (!bankName) return DEFAULT_CARD_ACCENT;
  const normalized = bankName.trim().toLowerCase();
  const matchedKey = Object.keys(BANK_ACCENT_MAP).find((key) => normalized.includes(key));
  return matchedKey ? BANK_ACCENT_MAP[matchedKey] : DEFAULT_CARD_ACCENT;
};

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
  MXN: "Peso mexicano",
  USD: "Dólar estadounidense",
  EUR: "Euro",
  GBP: "Libra esterlina",
  CHF: "Franco suizo",
  JPY: "Yen japonés",
};

const getCurrencyFlag = (currency) => currencyFlagMap[currency] || "";
const getCurrencySymbol = (currency) => currencySymbolMap[currency] || "";
const getCurrencyLabel = (account) => currencyLabelMap[account?.currency] || account?.name || "";
const maskAccountNumber = (last4) => `.........${String(last4).slice(-4)}`;

function ContactlessWave({ className = "w-5 h-5 text-white/70" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M8.5 14.5a2.5 2.5 0 0 0 0-5" />
      <path d="M11.5 17.5a6.5 6.5 0 0 0 0-11" />
      <path d="M14.5 20.5a10.5 10.5 0 0 0 0-17" />
    </svg>
  );
}

function CardChip({ isActive }) {
  return (
    <div className={`relative w-10 h-7 rounded bg-gradient-to-br from-[#dfc180] via-[#e2b755] to-[#bfa05d] p-0.5 shadow-inner overflow-hidden border border-[#d6b25e]/30 ${isActive ? "opacity-100" : "opacity-70"}`}>
      {/* Grid line texture */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-20">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-[#0f172a]" />
        ))}
      </div>
      <div className="absolute top-1/2 left-0 right-0 h-px bg-[#0f172a]/20" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#0f172a]/20" />
      <div className="absolute inset-1.5 border border-[#0f172a]/20 rounded-[2px]" />
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [carouselDirection, setCarouselDirection] = useState(0);
  const [notification, setNotification] = useState("");
  const [cards, setCards] = useState([]);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const loadProfileAndData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const prof = await getProfile();
        setProfile(prof);

        const dash = await getDashboardData();
        setDashboardData(dash);

        const userCards = await getAllUserCards();
        setCards(userCards);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    loadProfileAndData();
  }, [navigate]);

  const hasCards = cards.length > 0;
  const activeCard = cards[activeCardIndex];
  const userName = profile?.user?.username || profile?.user?.name || "Usuario";

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  const goToPreviousCard = () => {
    setCarouselDirection(-1);
    setActiveCardIndex((currentIndex) =>
      currentIndex === 0 ? cards.length - 1 : currentIndex - 1
    );
  };

  const goToNextCard = () => {
    setCarouselDirection(1);
    setActiveCardIndex((currentIndex) =>
      currentIndex === cards.length - 1 ? 0 : currentIndex + 1
    );
  };

  const openCardDashboard = () => {
    navigate(`/dashboard/${activeCard.accountId}`, {
      state: {
        cardId: activeCard.id,
        accountId: activeCard.accountId,
        bankName: activeCard.bankName,
      },
    });
  };

  const refreshCards = async () => {
    try {
      const userCards = await getAllUserCards();
      setCards(userCards);
      return userCards;
    } catch (err) {
      console.error(err);
      return cards;
    }
  };

  const handleAccountCreated = async (newAccount) => {
    const userCards = await refreshCards();
    const newIndex = userCards.findIndex((c) => c.accountId === newAccount?.id);
    setActiveCardIndex(newIndex >= 0 ? newIndex : Math.max(userCards.length - 1, 0));
    triggerNotification(`Cuenta en ${newAccount?.bank_name ?? "el banco"} creada correctamente.`);
  };

  const selectCard = (index) => {
    if (index === activeCardIndex) {
      openCardDashboard();
      return;
    }
    setCarouselDirection(index > activeCardIndex ? 1 : -1);
    setActiveCardIndex(index);
  };

  const visibleCards = !hasCards
    ? []
    : cards.length === 1
    ? [{ ...cards[0], offset: 0 }]
    : cards.length === 2
    ? [
        { ...cards[activeCardIndex], offset: 0 },
        { ...cards[activeCardIndex === 0 ? 1 : 0], offset: activeCardIndex === 0 ? 1 : -1 },
      ].sort((a, b) => a.offset - b.offset)
    : [-1, 0, 1].map((offset) => {
        const index = (activeCardIndex + offset + cards.length) % cards.length;
        return { ...cards[index], offset };
      });

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

        {/* ================================= SIDEBAR LATERAL ================================= */}
        <aside className="hidden border-r border-white/5 bg-[#0f0d2c] p-6 lg:flex lg:flex-col justify-between">
          <div className="space-y-8">
            {/* Logo UPAY */}
            <div className="mb-8 pl-4">
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
                className="flex h-12 w-full items-center gap-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 px-4 text-sm font-bold text-white transition-all shadow-md shadow-indigo-950/20"
                onClick={() => navigate("/profile")}
                type="button"
              >
                <UserPlus size={18} className="text-indigo-400" />
                Perfil
              </button>
            </nav>
          </div>

          <div className="space-y-4 mt-auto">
            {/* Cerrar sesión */}
            <button
              className="flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-bold text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
              onClick={logout}
              type="button"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
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
                onClick={() => triggerNotification("Configuración de perfil cargada.")}
              >
                <Settings size={20} />
              </button>

              <button
                className="inline-flex h-12 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500"
                onClick={() => setIsAddAccountModalOpen(true)}
                type="button"
              >
                <Plus size={18} />
                <span>Agregar cuenta</span>
              </button>
            </div>
          </header>

          {!hasCards ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-white/60 text-sm">No tienes tarjetas registradas todavía.</p>
              <p className="text-white/40 text-xs mt-2">Agrega una cuenta bancaria para obtener tu primera tarjeta.</p>
              <button
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500"
                onClick={() => setIsAddAccountModalOpen(true)}
                type="button"
              >
                <Plus size={16} />
                <span>Agregar cuenta</span>
              </button>
            </div>
          ) : (
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#403585] via-[#2c235a] to-[#120d29] p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(139,125,255,0.36),transparent_44%)] pointer-events-none" />
              <div className="absolute -right-24 -top-24 h-[300px] w-[560px] rotate-[-12deg] rounded-[40%] bg-gradient-to-r from-indigo-500/10 via-purple-500/20 to-transparent blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between w-full gap-4">
                <button
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 shadow-md transition hover:bg-white/15 hover:text-white focus:outline-none"
                  onClick={goToPreviousCard}
                  title="Tarjeta anterior"
                  type="button"
                >
                  <ChevronLeft size={22} />
                </button>

                <div className="relative h-[230px] flex-1 min-w-0 overflow-hidden py-4 sm:h-[300px]">
                  {visibleCards.map((card) => {
                    const isActive = card.offset === 0;
                    const isNu = card.bankName?.toLowerCase() === "nu";
                    const accent = getBankAccent(card.bankName);
                    const slidePosition = card.offset === 0
                      ? "-50%"
                      : card.offset > 0
                        ? "calc(-50% + 360px)"
                        : "calc(-50% - 360px)";
                    const cardScale = isActive ? 1 : 0.74;
                    const cardOpacity = isActive ? 1 : 0.68;

                    let cardStyles = {
                      boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0, 0, 0, 0.1)',
                    };

                    if (isActive) {
                      cardStyles.boxShadow = 'inset 0 0 0 1.5px rgba(255, 255, 255, 0.18), 0 18px 40px rgba(0, 0, 0, 0.28)';
                    }

                    return (
                      <motion.button
                        animate={{
                          opacity: cardOpacity,
                          scale: cardScale,
                          x: slidePosition,
                          y: "-50%",
                        }}
                        className={`absolute left-1/2 top-1/2 h-[200px] w-[320px] overflow-hidden rounded-2xl p-5 text-left sm:h-[260px] sm:w-[440px] sm:p-7 ${accent} ${
                          isActive
                            ? "z-10 cursor-default opacity-100"
                            : "z-0 cursor-pointer opacity-60"
                        }`}
                        initial={false}
                        key={card.id}
                        onClick={() => selectCard(cards.findIndex((c) => c.id === card.id))}
                        style={cardStyles}
                        transition={{
                          opacity: {
                            duration: 0.52,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          scale: {
                            duration: 0.62,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          x: {
                            duration: 0.62,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          y: { duration: 0 },
                        }}
                        type="button"
                        title={isActive ? "Abrir dashboard" : `Seleccionar ${card.bankName}`}
                      >
                        <div className="relative z-10 flex h-full flex-col justify-between">
                          {/* Top card block */}
                          <div className="flex items-start justify-between">
                            <p className={`font-black tracking-tight text-white select-none ${
                              isNu ? "text-2xl sm:text-3xl lowercase" : "text-xl sm:text-2xl"
                            }`}>
                              {card.bankName}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 my-auto">
                            <CardChip isActive={isActive} />
                            <ContactlessWave className="w-5 h-5 sm:w-6 sm:h-6 text-white/50" />
                          </div>

                          <div>
                            <p className="font-mono text-xs sm:text-lg font-medium tracking-[0.22em] text-white">
                              {maskAccountNumber(card.last4)}
                            </p>

                            <div className="mt-5 flex items-end justify-end">
                              {/* Brand Card Logo */}
                              <div className="h-5 sm:h-7 flex items-center justify-end">
                                {card.brand === "mastercard" ? (
                                  <div className="relative w-8 h-5 sm:w-10 sm:h-6 flex items-center">
                                    <span className="absolute left-0 block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#eb001b]" />
                                    <span className="absolute right-0 block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#f79e1b] opacity-90" style={{ mixBlendMode: "screen" }} />
                                  </div>
                                ) : (
                                  <span className="text-lg sm:text-xl font-black italic tracking-tighter text-white/90 leading-none select-none">
                                    VISA
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next button */}
                <button
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 shadow-md transition hover:bg-white/15 hover:text-white focus:outline-none"
                  onClick={goToNextCard}
                  title="Siguiente tarjeta"
                  type="button"
                >
                  <ChevronRight size={22} />
                </button>
              </div>

              {/* Dots navigation */}
              <div className="mt-8 flex justify-center gap-3">
                {cards.map((card, index) => (
                  <button
                    aria-label={`Mostrar tarjeta ${card.bankName}`}
                    className="relative h-1.5 w-8 rounded-full bg-white/15 transition hover:bg-white/25 focus:outline-none"
                    key={card.id}
                    onClick={() => selectCard(index)}
                    type="button"
                  >
                    {index === activeCardIndex && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-indigo-400 shadow-md shadow-indigo-400/30"
                        layoutId="active-card-dot"
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}


          {/* ================================= PANEL DE DIVISAS (BOTTOM) ================================= */}
          {false && dashboardData && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-[#0f0d2c]/60 border border-white/5 rounded-3xl p-6 backdrop-blur-md"
            >
              <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                <span>Divisas</span>
                <button
                  onClick={() => triggerNotification("Módulo completo de divisas cargado.")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Ver todas <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {dashboardData.accounts
                  .filter((acc) => acc.id !== "mxn-remunerada")
                  .map((acc) => {
                    const symbol = getCurrencySymbol(acc.currency);

                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          triggerNotification(`Has seleccionado la cartera de ${acc.name}.`);
                        }}
                        className="flex min-w-[200px] items-center gap-3 rounded-2xl bg-white/5 border border-transparent p-3 hover:bg-white/10 transition text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                        type="button"
                      >
                        <Flag countryCode={getCurrencyFlag(acc.currency)} className="size-10 rounded-full overflow-hidden border border-white/10" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white/50">{getCurrencyLabel(acc)}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-sm font-bold text-white">
                              {symbol}{acc.balance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </p>
                            {acc.currency === "MXN" && (
                              <span className="grid size-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-400" title="Cuenta principal">
                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                {/* divisas */}
                <button
                  onClick={() => triggerNotification("Mostrando catálogo completo de divisas.")}
                  className="flex min-w-[200px] items-center gap-3 rounded-2xl bg-white/5 border border-transparent p-3 hover:bg-white/10 transition text-left cursor-pointer focus:outline-none"
                  type="button"
                >
                  <div className="grid size-10 place-items-center rounded-full bg-[#1e1a44] border border-white/10 text-white/70 shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/50">Todas las divisas</p>
                    <p className="text-sm font-bold text-indigo-400 mt-0.5">Explorar más</p>
                  </div>
                </button>
              </div>
            </motion.section>
          )}

        </section>
      </div>

      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </main>
  );
}
