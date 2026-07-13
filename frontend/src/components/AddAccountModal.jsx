import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Landmark, Loader2 } from "lucide-react";
import { createAccount, createCard } from "../services/accountService";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "checking", label: "Cuenta corriente" },
  { value: "savings", label: "Cuenta de ahorro" },
];

const CURRENCY_OPTIONS = [
  { value: "MXN", label: "Peso mexicano (MXN)" },
  { value: "USD", label: "Dólar estadounidense (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "Libra esterlina (GBP)" },
  { value: "CHF", label: "Franco suizo (CHF)" },
  { value: "JPY", label: "Yen japonés (JPY)" },
];

const YEARS_AHEAD = 7;

const initialFormState = {
  bankName: "",
  accountType: "checking",
  currency: "MXN",
};

function generateRandomCardData() {
  const last4 = String(Math.floor(1000 + Math.random() * 9000));

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const expiryYear = currentYear + Math.floor(Math.random() * (YEARS_AHEAD + 1));
  const minMonth = expiryYear === currentYear ? currentMonth : 1;
  const expiryMonth = minMonth + Math.floor(Math.random() * (12 - minMonth + 1));

  return {
    last4,
    brand: "visa",
    cardType: "debit",
    expiryMonth,
    expiryYear,
  };
}

export function AddAccountModal({ isOpen, onClose, onAccountCreated }) {
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

  const validate = () => {
    if (!form.bankName.trim()) return "Ingresa el nombre del banco.";
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
      const newAccount = await createAccount({
        bankName: form.bankName.trim(),
        accountType: form.accountType,
        currency: form.currency,
      });

      try {
        await createCard(newAccount.id, generateRandomCardData());
      } catch (cardErr) {
        console.error("Error generando la tarjeta automática:", cardErr);
      }

      await onAccountCreated?.(newAccount);
      setForm(initialFormState);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || "No se pudo crear la cuenta. Intenta de nuevo.");
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
                  <Landmark size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">Agregar cuenta bancaria</h2>
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
              {/* Banco */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Nombre del banco
                </label>
                <input
                  className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-indigo-500/50"
                  onChange={updateField("bankName")}
                  placeholder="Ej. BBVA, Banorte, Nu..."
                  type="text"
                  value={form.bankName}
                />
              </div>

              {/* Tipo de cuenta y moneda */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                    Tipo de cuenta
                  </label>
                  <select
                    className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                    onChange={updateField("accountType")}
                    value={form.accountType}
                  >
                    {ACCOUNT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                    Moneda
                  </label>
                  <select
                    className="w-full rounded-xl bg-[#1e1a44] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                    onChange={updateField("currency")}
                    value={form.currency}
                  >
                    {CURRENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 text-xs text-indigo-200">
                Al crear la cuenta se generará automáticamente una tarjeta Visa débito.
              </p>

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
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
