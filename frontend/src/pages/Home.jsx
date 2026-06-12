import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Landmark,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import heroCarouselPlane from "../assets/aviosn .png";
import heroCarouselBuilding from "../assets/hero-carousel-building.png";
import heroCarouselPhone from "../assets/hero-carousel-phone.png";



const highlights = [
  {
    title: "Cuentas bancarias",
    text: "Panel listo para listar, crear y editar cuentas desde Account Service.",
    icon: Landmark,
  },
  {
    title: "Region y divisa",
    text: "La interfaz reserva espacio para localizacion y conversion automatica.",
    icon: MapPin,
  },
  {
    title: "Notificaciones",
    text: "Avisos de seguridad, movimientos y conversiones en una sola vista.",
    icon: Bell,
  },
];

const heroSlides = [
  {
    image: heroCarouselPhone,
    label: "App UPAY",
  },
  {
    image: heroCarouselBuilding,
    label: "Banca global",
  },
  {
    image: heroCarouselPlane,
    label: "Viajes internacionales",
  },
];

const HERO_SLIDE_INTERVAL_MS = 15000;

export function Home() {
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f7f8] text-slate-950">
      <nav className="fixed inset-x-0 top-0 z-30 border-b border-white/15 bg-slate-950/10 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link className="flex items-center gap-2 text-lg font-bold" to="/">
            <span className="grid size-9 place-items-center rounded-lg bg-white/15 text-white ring-1 ring-white/30">
              U
            </span>
            UPAY   
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
            <a href="#servicios">Servicios</a>
            <a href="#experiencia">Experiencia</a>
            <Link to="/login">Acceso</Link>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950"
            to="/register"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-12 pt-24 text-white">
        {heroSlides.map((slide, index) => (
          <img
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${
              index === activeHeroSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            key={slide.label}
            src={slide.image}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.68)_36%,rgba(2,6,23,0.18)_72%,rgba(2,6,23,0.22)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f7f8] via-[#f4f7f8]/35 to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl pt-8">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur"
            initial={{ opacity: 0, y: 16 }}
          >
            <ShieldCheck size={16} />
            Banca inteligente
          </motion.p>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl font-bold leading-[1.02] text-white drop-shadow-2xl md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.08 }}
          >
            Tu mundo financiero en una sola vista.
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-lg text-lg leading-8 text-white/90 drop-shadow"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.16 }}
          >
            Banca inteligente para cuentas internacionales, tipos de cambio en
            tiempo real y notificaciones instantaneas.
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.24 }}
          >
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-400"
              to="/login"
            >
              Iniciar sesion
              <ArrowRight size={18} />
            </Link>
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.32 }}
          >
            {heroSlides.map((slide, index) => (
              <button
                aria-label={`Ver imagen ${index + 1}: ${slide.label}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeHeroSlide ? "w-10 bg-cyan-300" : "w-2.5 bg-white/40"
                }`}
                key={slide.label}
                onClick={() => setActiveHeroSlide(index)}
                type="button"
              />
            ))}
          </motion.div>
        </div>

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-2" id="servicios">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <motion.article
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                initial={{ opacity: 0, y: 18 }}
                key={item.title}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <div className="mb-5 grid size-11 place-items-center rounded-lg bg-slate-950 text-white">
                  <Icon size={21} />
                </div>
                <h2 className="text-xl font-bold">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
