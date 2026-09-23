'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Dumbbell,
  CreditCard,
  Clock,
  BarChart3,
  LogOut,
  Menu,
  X,
  Eye,
  Home,
  User,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import LiquidGlassNav from './LiquidGlassNav';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const isProfesor = user?.rol === 'profesor';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('e22_user');
      localStorage.removeItem('zinerva_user');
      document.cookie = 'e22_role=; path=/; max-age=0;';
    }
    router.replace('/');
  };

  // Consultar pagos pendientes si es profesor
  useEffect(() => {
    if (isProfesor) {
      fetch('/api/pagos?estado=pendiente')
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && Array.isArray(data.pagos)) {
            setPendingPaymentsCount(data.pagos.length);
          }
        })
        .catch(() => { });
    }
  }, [isProfesor, pathname]);

  // Links de navegación según Rol
  const profesorLinks = [
    {
      id: 'socios',
      label: 'Socios y Rutinas',
      href: '/dashboard/profesor',
      icon: Users,
      isActive: pathname === '/dashboard/profesor',
    },
    {
      id: 'pagos',
      label: 'Aprobación de Pagos',
      href: '/dashboard/profesor/pagos',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null,
      isActive: pathname === '/dashboard/profesor/pagos',
    },
    {
      id: 'rutinas',
      label: 'Estudio de Rutinas',
      href: '/dashboard/profesor/rutinas',
      icon: Dumbbell,
      isActive: pathname === '/dashboard/profesor/rutinas',
    },
    {
      id: 'configuracion',
      label: 'Horarios & Precios',
      href: '/dashboard/profesor/configuracion',
      icon: Clock,
      isActive: pathname === '/dashboard/profesor/configuracion',
    },
  ];

  const alumnoLinks = [
    {
      id: 'membresia',
      label: 'Mi Membresía',
      href: '/dashboard/alumno',
      icon: Home,
      isActive: pathname === '/dashboard/alumno',
    },
    {
      id: 'rutina',
      label: 'Planilla de Rutina',
      href: '/dashboard/alumno/rutina',
      icon: Dumbbell,
      isActive: pathname === '/dashboard/alumno/rutina',
    },
    {
      id: 'progreso',
      label: 'Registro de Cargas',
      href: '/dashboard/alumno/progreso',
      icon: BarChart3,
      isActive: pathname === '/dashboard/alumno/progreso',
    },
    {
      id: 'pagos',
      label: 'Notificar Pago',
      href: '/dashboard/alumno/pagos',
      icon: CreditCard,
      isActive: pathname === '/dashboard/alumno/pagos',
    },
  ];

  const navLinks = isProfesor ? profesorLinks : alumnoLinks;

  // Ítems para la barra inferior móvil Liquid Glass
  const mobileNavItems = isProfesor
    ? [
      { id: 'socios', label: 'Socios', icon: Users, href: '/dashboard/profesor' },
      { id: 'rutinas', label: 'Rutinas', icon: Dumbbell, href: '/dashboard/profesor/rutinas' },
      { id: 'pagos', label: 'Pagos', icon: CreditCard, href: '/dashboard/profesor/pagos' },
      { id: 'config', label: 'Horarios', icon: Clock, href: '/dashboard/profesor/configuracion' },
      {
        id: 'menu',
        label: 'Menú',
        icon: User,
        onClick: () => setMobileMenuOpen((prev) => !prev),
        isActive: mobileMenuOpen,
      },
    ]
    : [
      { id: 'inicio', label: 'Inicio', icon: Home, href: '/dashboard/alumno' },
      { id: 'rutina', label: 'Rutina', icon: Dumbbell, href: '/dashboard/alumno/rutina' },
      { id: 'progreso', label: 'Cargas', icon: BarChart3, href: '/dashboard/alumno/progreso' },
      { id: 'pagos', label: 'Pagos', icon: CreditCard, href: '/dashboard/alumno/pagos' },
      {
        id: 'menu',
        label: 'Menú',
        icon: User,
        onClick: () => setMobileMenuOpen((prev) => !prev),
        isActive: mobileMenuOpen,
      },
    ];

  const homeHref = isProfesor ? '/dashboard/profesor' : '/dashboard/alumno';
  const roleLabel = isProfesor ? 'PROFESOR' : 'SOCIO';
  const displayName =
    user?.nombre_completo || user?.nombre || (isProfesor ? 'Profesor E22' : 'Socio');

  return (
    <>
      {/* ================= 1. NAVEGADOR SUPERIOR CENTRADO CON GLASS EFFECT (ESTILO INICIO) ================= */}
      <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl">
        <div className="relative flex items-center justify-between px-3 sm:px-5 py-2 rounded-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 transition-all duration-300">
          {/* LOGO & BRAND */}
          <Link href={homeHref} className="flex items-center gap-2.5 group focus:outline-none pl-1">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-black border border-white/20 shrink-0 group-hover:scale-105 transition-transform p-0.5 shadow-md">
              <Image src="/logo.png" alt="e22 Gym" fill className="object-contain" priority />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black tracking-widest text-white block leading-none">
                e22 GYM
              </span>
              <span
                className={`hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${isProfesor
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/50'
                  : 'text-cyan-400 bg-cyan-950/80 border-cyan-800/50'
                  }`}
              >
                {roleLabel}
              </span>
            </div>
          </Link>

          {/* ENLACES CENTRALES EN ESCRITORIO */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 relative ${link.isActive
                    ? 'bg-white/15 text-white font-bold border border-white/15 shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-zinc-950 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ACCIONES Y PERFIL (DERECHA) */}
          <div className="flex items-center gap-2">
            {/* Switcher Vista Alumno para el Profesor */}
            {isProfesor && (
              <Link
                href="/dashboard/alumno"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 rounded-full transition"
                title="Previsualizar experiencia de alumno"
              >
                <Eye className="w-3 h-3 text-zinc-400" />
                <span>Vista Alumno</span>
              </Link>
            )}

            {/* Chip de usuario */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-zinc-300 max-w-[120px] truncate leading-tight">
                {displayName}
              </span>
            </div>

            {/* Botón Salir / Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 flex items-center gap-1.5 text-xs font-semibold"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>

            {/* Hamburguesa en móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10 ml-1"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* MODAL / DRAWER MÓVIL ESTILO GLASS */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="md:hidden absolute top-full mt-2 left-0 right-0 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/90 z-50 space-y-4"
            >
              {/* Usuario info */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-black text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{displayName}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {isProfesor ? 'admin@e22gym.com' : `DNI: ${user?.dni || 'Socio'}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${isProfesor
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/50'
                    : 'text-cyan-400 bg-cyan-950/80 border-cyan-800/50'
                    }`}
                >
                  {roleLabel}
                </span>
              </div>

              {/* Links de navegación */}
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${link.isActive
                        ? 'bg-white text-zinc-950 shadow-md'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-zinc-950 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Si es profesor, opción para ver vista alumno */}
                {isProfesor && (
                  <Link
                    href="/dashboard/alumno"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ir a Vista Alumno</span>
                  </Link>
                )}
                {/* Acceso a Coach Virtual IA */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('e22-open-coach'));
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/30 text-xs font-bold text-white shadow-lg active:scale-95 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white flex items-center gap-1.5">
                        Coach Virtual E22
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded">
                          GEMINI IA
                        </span>
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Dudas de rutina, técnica y RIR
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Botón Logout */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================= 2. BARRA INFERIOR MÓVIL LIQUID GLASS (APPLE / INSTAGRAM) ================= */}
      <LiquidGlassNav items={mobileNavItems} />
    </>
  );
}
