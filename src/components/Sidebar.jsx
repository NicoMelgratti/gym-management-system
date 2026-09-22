'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  BarChart3,
  LogOut,
  CreditCard,
  Search,
  Menu,
  X,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export default function Sidebar({ user, activeTab, onTabChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isProfesor = user?.rol === 'profesor';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('e22_user');
      localStorage.removeItem('zinerva_user');
    }
    router.push('/');
  };

  // Bloquear scroll del body cuando el menú móvil está abierto y escuchar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };

    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  // Contenido compartido del menú de navegación
  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4">
        {/* Header con Logo E22 */}
        <div className="p-5 border-b border-e22-border flex items-center justify-between">
          <Link
            href={isProfesor ? '/dashboard/profesor' : '/dashboard/alumno'}
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0">
              <Image src="/logo.png" alt="E22 Gym" fill className="object-cover" priority />
            </div>
            <div>
              <span className="text-base font-black tracking-widest text-white block leading-none">
                E22 GYM
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block mt-1">
                ELITE CORE
              </span>
            </div>
          </Link>

          {/* Botón de cierre visible solo en móvil */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador de registros */}
        <div className="px-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar registros..."
              className="w-full bg-e22-bg border border-e22-border rounded-lg pl-8 pr-7 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
              /
            </span>
          </div>
        </div>

        {/* Switcher de Rol si es Profesor */}
        {isProfesor && (
          <div className="px-4">
            <div className="bg-e22-bg p-1 rounded-xl border border-e22-border flex flex-col gap-1">
              <Link
                href="/dashboard/profesor"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  pathname.startsWith('/dashboard/profesor')
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel Entrenador</span>
              </Link>
              <Link
                href="/dashboard/alumno"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  pathname.startsWith('/dashboard/alumno')
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Vista Alumno</span>
              </Link>
            </div>
          </div>
        )}

        {/* Menú de Navegación según Rol */}
        <nav className="px-3 space-y-1">
          {isProfesor ? (
            <>
              <Link
                href="/dashboard/profesor"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/profesor'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Socios y Rutinas</span>
              </Link>

              <Link
                href="/dashboard/profesor/pagos"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/profesor/pagos'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4" />
                  <span>Aprobación de Pagos</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </Link>

              <Link
                href="/dashboard/profesor/rutinas"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/profesor/rutinas'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>Estudio de Rutinas</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard/alumno"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/alumno'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Mi Membresía</span>
              </Link>

              <Link
                href="/dashboard/alumno/rutina"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/alumno/rutina'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>Planilla de Rutina</span>
              </Link>

              <Link
                href="/dashboard/alumno/progreso"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/alumno/progreso'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Registro de Cargas</span>
              </Link>

              <Link
                href="/dashboard/alumno/pagos"
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/alumno/pagos'
                    ? 'bg-white text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-e22-card'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Notificar Pago</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Pie de barra con usuario y logout */}
      <div className="p-4 border-t border-e22-border bg-e22-bg space-y-3">
        {user && (
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user.nombre_completo || user.nombre}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">
                {isProfesor ? 'admin@e22gym.com' : `DNI: ${user.dni}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="text-[9px] font-mono text-zinc-600 tracking-wider text-center">
          V2.4.0 ELITE CORE
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ================= 1. BARRA SUPERIOR MÓVIL (VISIBLE EN < LG) ================= */}
      <div className="lg:hidden sticky top-0 z-40 w-full bg-e22-surface/95 backdrop-blur-md border-b border-e22-border px-4 py-3 flex items-center justify-between shadow-md">
        <Link
          href={isProfesor ? '/dashboard/profesor' : '/dashboard/alumno'}
          className="flex items-center gap-2.5"
        >
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0">
            <Image src="/logo.png" alt="E22 Gym" fill className="object-cover" priority />
          </div>
          <span className="text-sm font-black tracking-wider text-white">E22 GYM</span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 max-w-[120px] truncate">
              {isProfesor ? 'PROFESOR' : user.nombre || 'SOCIO'}
            </span>
          )}

          {/* Botón Hamburguesa */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-e22-card border border-e22-border hover:bg-zinc-800 text-white rounded-xl transition flex items-center justify-center shadow-sm"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ================= 2. MENÚ DRAWER LATERAL MÓVIL (CON BACKDROP) ================= */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Fondo semi-transparente que cierra el menú al tocar afuera */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Panel deslizante lateral */}
          <div className="relative w-72 max-w-[85vw] bg-e22-surface h-full shadow-2xl border-r border-e22-border z-10 flex flex-col animate-in slide-in-from-left duration-250">
            {navContent}
          </div>
        </div>
      )}

      {/* ================= 3. SIDEBAR ESCRITORIO PERMANENTE (VISIBLE EN >= LG) ================= */}
      <aside className="hidden lg:flex w-64 bg-e22-surface border-r border-e22-border flex-col shrink-0 min-h-screen">
        {navContent}
      </aside>
    </>
  );
}
