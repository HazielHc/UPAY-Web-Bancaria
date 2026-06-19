import { Link } from "react-router-dom";
import { ArrowRight, UserPlus } from "lucide-react";
import { login, register } from "../services/authService";
import {useState} from "react";
import { useNavigate } from "react-router-dom";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.51Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.91a6 6 0 0 1 0-3.82V7.51H3.07a10 10 0 0 0 0 8.98l3.34-2.58Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.97c1.47 0 2.8.51 3.84 1.5l2.87-2.88C16.97 2.97 14.7 2 12 2a10 10 0 0 0-8.93 5.51l3.34 2.58C7.2 7.73 9.4 5.97 12 5.97Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function Register() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try{
      const data = await register(user, email, password);
      await login(email, password);
      console.log("REGISTER GOD:", data);

      navigate("/profile");
    } catch(error){
      console.error("Error register:", error.message);
    }
  }
  return (
    <section className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 md:grid-cols-[0.9fr_1fr]">
      <div>
        <Link className="mb-10 inline-flex items-center gap-2 text-lg font-bold" to="/">
          <span className="grid size-10 place-items-center rounded-lg bg-white text-slate-950">
            U
          </span>
          UPAY
        </Link>
        <h1 className="text-5xl font-bold leading-tight">Crea tu acceso bancario.</h1>
        <p className="mt-5 max-w-md leading-7 text-slate-300">
          Registro visual preparado para enviar datos al servicio de autenticacion.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        
        <h2 className="text-3xl font-bold">Registro</h2>
        <p className="mt-2 text-slate-300">Crea tu perfil para gestionar tus cuentas.</p>

        <form className="mt-8 space-y-4">
          <input
            className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="Nombre"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="Contrasena"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            type="button"
            onClick={handleRegister}
          >
            Crear cuenta
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="h-px flex-1 bg-white/10" />
          o registrate con
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <button
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-4 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
          type="button"
        >
          <GoogleIcon />
          Registrarse con Google
        </button>

        <Link className="mt-5 inline-flex text-sm text-cyan-300" to="/login">
          Ya tengo cuenta
        </Link>
      </div>
    </section>
  );
}
