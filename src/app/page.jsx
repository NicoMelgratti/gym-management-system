'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  BarChart3,
  Search,
  Lock,
  Mail,
  User,
  Phone,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AccessPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'

  // Formulario Sign In
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  // Formulario Registro
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    password: '',
    alergias: '',
    patologias: '',
    dias_asistencia: 4,
  });
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [errorRegister, setErrorRegister] = useState('');
  const [successRegister, setSuccessRegister] = useState('');

  // Manejar Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorLogin('Por favor, ingresa tu usuario o DNI y contraseña.');
      return;
    }

    setLoadingLogin(true);
    setErrorLogin('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Credenciales inválidas.');
      }

      localStorage.setItem('e22_user', JSON.stringify(data.user));

      if (data.user.rol === 'profesor') {
        router.push('/dashboard/profesor');
      } else {
        router.push('/dashboard/alumno');
      }
    } catch (err) {
      setErrorLogin(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  // Manejar Registro
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.dni.trim() || !formData.password.trim()) {
      setErrorRegister('Nombre, DNI y Contraseña son obligatorios.');
      return;
    }

    setLoadingRegister(true);
    setErrorRegister('');
    setSuccessRegister('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Error al completar el registro.');
      }

      setSuccessRegister('¡Registro completado! Redirigiendo a tu portal...');
      localStorage.setItem('e22_user', JSON.stringify(data.user));

      setTimeout(() => {
        router.push('/dashboard/alumno');
      }, 1000);
    } catch (err) {
      setErrorRegister(err.message);
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col lg:flex-row font-sans selection:bg-white selection:text-black">
      {/* Barra superior visible solo en móvil */}
      <div className="lg:hidden p-4 border-b border-e22-border flex items-center justify-between bg-e22-surface">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0">
            <Image src="/logo.png" alt="E22 Logo" fill className="object-cover" priority />
          </div>
          <div>
            <span className="text-sm font-black tracking-widest text-white block leading-none">E22 GYM</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block mt-0.5">ELITE CORE</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
          PORTAL OFICIAL
        </span>
      </div>

      {/* 1. BARRA LATERAL IZQUIERDA (Escritorio >= lg) */}
      <aside className="hidden lg:flex w-60 bg-e22-surface border-r border-e22-border flex-col justify-between shrink-0 p-5">
        <div className="space-y-6">
          {/* Logo E22 */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0">
              <Image src="/logo.png" alt="E22 Logo" fill className="object-cover" priority />
            </div>
            <span className="text-base font-black tracking-widest text-white">E22 GYM</span>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar registros..."
              className="w-full bg-e22-bg border border-e22-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Menú de enlaces */}
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-white text-zinc-950 shadow transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-e22-card transition"
            >
              <Users className="w-4 h-4" />
              <span>Socios</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-e22-card transition"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Entrenadores</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-e22-card transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Horarios</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-e22-card transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Estadísticas</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 text-[9px] font-mono text-zinc-600 tracking-wider">
          V2.4.0 ELITE CORE
        </div>
      </aside>

      {/* 2. ÁREA CENTRAL HERO + FORMULARIO DERECHA */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-8 lg:p-12 gap-8 lg:gap-12 max-w-7xl mx-auto w-full">
        {/* HERO IZQUIERDA */}
        <div className="flex-1 space-y-6 lg:space-y-8 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 bg-e22-surface px-3 py-1.5 rounded-md border border-e22-border">
            <span className="w-2 h-2 rounded-full bg-white" />
            PORTAL SEGURO // 01
          </div>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] text-white">
              E22 GYM
            </h1>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] text-zinc-500">
              ALCANZA TU
            </h2>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] text-white">
              MÁXIMO NIVEL
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
            Máxima calidad. Cero distracciones. Entra al santuario de entrenamiento privado diseñado para atletas que exigen precisión y disciplina física absoluta.
          </p>

          {/* Estadísticas de pie */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-e22-border/60">
            <div>
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight">24/7</p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5">Acceso</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight">0%</p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5">Distracciones</p>
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-black text-white tracking-tight">100%</p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5">Enfoque Elite</p>
            </div>
          </div>
        </div>

        {/* 3. TARJETA DE ACCESO / REGISTRO DERECHA */}
        <div className="w-full max-w-md bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-7 shadow-2xl space-y-5">
          {/* Pestañas SIGN IN / REGISTER */}
          <div className="flex bg-e22-bg p-1 rounded-xl border border-e22-border">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'signin'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              INGRESAR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'register'
                  ? 'bg-white text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              REGISTRARSE
            </button>
          </div>

          {/* ================= FORMULARIO SIGN IN ================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  EMAIL ADDRESS / DNI / USUARIO
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e22gym o tu DNI"
                    className="w-full bg-e22-bg border border-e22-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono transition"
                    disabled={loadingLogin}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    PASSWORD
                  </label>
                  <span className="text-[10px] text-zinc-500">Forgot?</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-e22-bg border border-e22-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 font-mono transition"
                    disabled={loadingLogin}
                  />
                </div>
              </div>

              {errorLogin && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorLogin}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loadingLogin}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg disabled:opacity-50 mt-2"
              >
                {loadingLogin ? 'AUTHORIZING...' : 'AUTHORIZE ACCESS'}
              </button>

              <div className="pt-3 text-center">
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  RESTRICTED AREA // BIOMETRIC CREDENTIALS REQUIRED
                </p>
              </div>
            </form>
          )}

          {/* ================= FORMULARIO REGISTER ================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Lucas"
                    className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    placeholder="Ej: Rossi"
                    className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  DNI (Tu usuario para ingresar) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="Ej: 42893102"
                  className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+54 9 11..."
                    className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Elige tu clave"
                    className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Ficha médica */}
              <div className="p-3 bg-e22-bg/60 border border-e22-border rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ficha de Salud y Condiciones</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.alergias}
                    onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                    placeholder="Alergias (o 'Ninguna')"
                    className="w-full bg-e22-surface border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.patologias}
                    onChange={(e) => setFormData({ ...formData, patologias: e.target.value })}
                    placeholder="Patologías / Lesiones (o 'Ninguna')"
                    className="w-full bg-e22-surface border border-e22-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              {errorRegister && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400">
                  {errorRegister}
                </div>
              )}
              {successRegister && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400">
                  {successRegister}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingRegister}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg disabled:opacity-50 mt-1"
              >
                {loadingRegister ? 'ENROLLING...' : 'COMPLETE ENROLLMENT'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
