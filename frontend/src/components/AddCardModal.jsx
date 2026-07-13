import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Loader2 } from "lucide-react";
import { createCard } from "../services/accountService";

const BRAND_OPTIONS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "American Express" },
  { value: "other", label: "Otra" },
];

const CARD_TYPE_OPTIONS = [
  { value: "debit", label: "Débito" },
  { value: "credit", label: "Crédito" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 12 }, (_, i) => currentYear + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const initialFormState = {
  last4: "",
  brand: "visa",
  cardType: "debit",
  expiryMonth: "",
  expiryYear: "",
};

export function AddCardModal({ isOpen, onClose, onCardCreated, accountId, bankName }) {
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    if (isSubmitting) return;
    setForm(initialFormState);
    setError("");
    onClose();
  };

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLast4Change = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 4);
    setForm((prev) => ({ ...prev, last4: digitsOnly }));
  };

  const validate = () => {
    if (!accountId) return "No se pudo determinar la cuenta bancaria.";
    if (form.last4.length !== 4) return "Los últimos 4 dígitos deben ser exactamente 4 números.";
    if (!form.expiryMonth) return "Selecciona el mes de expiración.";
    if (!form.expiryYear) return "Selecciona el año de expiración.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const newCard = await createCard(accountId, {
        last4: form.last4,
        brand: form.brand,
        cardType: form.cardType,
        expiryMonth: Number(form.expiryMonth),
        expiryYear: Number(form.expiryYear),
      });

      await onCardCreated?.(newCard);
      setForm(initialFormState);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || "No se pudo crear la tarjeta. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={resetAndClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1640] p-6 shadow-2xl sm:p-8"
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-indigo-600/20 text-indigo-400">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">Agregar tarjeta</h2>
              </div>
              <button
                className="grid size-9 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                disabled={isSubmitting}
                onClick={resetAndClose}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Cuenta bancaria (automática, tomada del contexto actual) */}
              <div className="flex items-center gap-3 rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-600/20 text-indigo-400">
                  <CreditCard size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Cuenta</p>
                  <p className="truncate text-sm font-bold text-white">{bankName || "Cuenta bancaria"}</p>
                </div>
              </div>

              {/* Últimos 4 dígitos */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Últimos 4 dígitos
                </label>
                <input
                  className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none tracking-widest placeholder:text-white/30 focus:border-indigo-500/50"
                  inputMode="numeric"
                  maxLength={4}
                  onChange={handleLast4Change}
                  placeholder="0000"
                  value={form.last4}
                />
              </div>

              {/* Marca y tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                    Marca
                  </label>
                  <select
                    className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                    onChange={updateField("brand")}
                    value={form.brand}
                  >
                    {BRAND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                    Tipo
                  </label>
                  <select
                    className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                    onChange={updateField("cardType")}
                    value={form.cardType}
                  >
                    {CARD_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiración */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Expiración
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                    onChange={updateField("expiryMonth")}
                    value={form.expiryMonth}
                  >
                    <option value="">Mes</option>
                    {MONTH_OPTIONS.map((month) => (
                      <option key={month} value={month}>
                        {String(month).padStart(2, "0")}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                    onChange={updateField("expiryYear")}
                    value={form.expiryYear}
                  >
                    <option value="">Año</option>
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-xs font-semibold text-rose-400">
                  {error}
                </p>
              )}

              <button
                className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creando tarjeta...
                  </>
                ) : (
                  "Agregar tarjeta"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
