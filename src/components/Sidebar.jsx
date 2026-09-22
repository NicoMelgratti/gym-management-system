'use client';

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
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function Sidebar({ user, activeTab, onTabChange }) {
  const pathname = usePathname();
  const router = useRouter();

  const isProfesor = user?.rol === 'profesor';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('e22_user');
      localStorage.removeItem('zinerva_user');
    }
    router.push('/');
  };

  return (
    <aside className="w-64 bg-e22-surface border-r border-e22-border flex flex-col shrink-0 min-h-screen">
      {/* 1. Header con Logo E22 */}
      <div className="p-5 border-b border-e22-border flex items-center justify-between">
        <Link href={isProfesor ? '/dashboard/profesor' : '/dashboard/alumno'} className="flex items-center gap-3 group">
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
      </div>

      {/* 2. Buscador de registros con atajo */}
      <div className="px-4 py-3 border-b border-e22-border/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar registros..."
            className="w-full bg-e22-bg border border-e22-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono">
            /
          </span>
        </div>
      </div>

      {/* 3. Switcher de Rol si es Profesor */}
      {isProfesor && (
        <div className="p-3 border-b border-e22-border/60">
          <div className="bg-e22-bg p-1 rounded-xl border border-e22-border flex flex-col gap-1">
            <Link
              href="/dashboard/profesor"
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

      {/* 4. Menú de Navegación según Rol */}
      <nav className="p-3 space-y-1 flex-1">
        {isProfesor ? (
          <>
            <Link
              href="/dashboard/profesor"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
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

      {/* 5. Pie de barra con usuario y logout */}
      <div className="p-4 border-t border-e22-border bg-e22-bg space-y-3">
        {user && (
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {user.nombre_completo || user.nombre}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">
                {isProfesor ? 'admin@e22gym.com' : `DNI: ${user.dni}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition"
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
    </aside>
  );
}
