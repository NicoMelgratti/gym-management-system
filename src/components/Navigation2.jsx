'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Clock,
  Dumbbell,
  Sparkles,
  DollarSign,
  CreditCard,
  Building,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Flame,
  MapPin,
  Users,
} from 'lucide-react';

export default function Navigation2({
  onSignInClick = () => { },
  onRegisterClick = () => { },
  onHorariosClick = () => { },
  configuracion = null,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'clases' | 'membresias' | 'centro' | null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const cuotaValor = Number(configuracion?.precios?.cuota_mensual || 25000).toLocaleString('es-AR');

  return (
    <header ref={navRef} className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl">
      {/* ================= 1. BARRA PRINCIPAL CAPSULAR (GLASS) ================= */}
      <div className="relative flex items-center justify-between px-3 sm:px-5 py-2 rounded-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 transition-all duration-300">
        {/* LOGO & BRAND */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none pl-1"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-black border border-white/20 shrink-0 group-hover:scale-105 transition-transform p-0.5 shadow-md">
            <Image src="/logo.png" alt="e²² Gym" fill className="object-contain" priority />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-black tracking-widest text-white block leading-none">
              e²² GYM
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-800/50">
              CORE
            </span>
          </div>
        </Link>

        {/* ENLACES CENTRALES CON DROPDOWNS EXPANDIBLES (ESCRITORIO) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          {/* Item 1: Clases & Horarios */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('clases')}
              onMouseEnter={() => setActiveDropdown('clases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${activeDropdown === 'clases'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>Horarios & Clases</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'clases' ? 'rotate-180 text-emerald-400' : 'text-zinc-400'
                  }`}
              />
            </button>
          </div>

          {/* Item 2: Membresías & Tarifas */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('membresias')}
              onMouseEnter={() => setActiveDropdown('membresias')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${activeDropdown === 'membresias'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>Tarifas & Cuota</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'membresias' ? 'rotate-180 text-emerald-400' : 'text-zinc-400'
                  }`}
              />
            </button>
          </div>

          {/* Item 3: Centro E22 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('centro')}
              onMouseEnter={() => setActiveDropdown('centro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${activeDropdown === 'centro'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>Centro Elite</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'centro' ? 'rotate-180 text-emerald-400' : 'text-zinc-400'
                  }`}
              />
            </button>
          </div>

          {/* Item 4: Quiénes Somos */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(null);
              const el = document.getElementById('quienes-somos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Quiénes Somos
          </button>

          {/* Item 5: Ubicación */}
          <button
            type="button"
            onClick={() => {
              setActiveDropdown(null);
              const el = document.getElementById('ubicacion');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ubicación</span>
          </button>
        </nav>

        {/* ACCIONES / BOTONES DE ACCESO (DERECHA) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={onSignInClick}
            className="px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white transition rounded-full hover:bg-white/5"
          >
            Ingresar
          </button>

          <button
            type="button"
            onClick={onRegisterClick}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black tracking-wide transition shadow-lg hover:shadow-white/10"
          >
            <span>Registrarse</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* BOTÓN MÓVIL (HAMBURGUESA) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={onSignInClick}
            className="px-2.5 py-1 text-[11px] font-bold text-zinc-300 hover:text-white"
          >
            Ingresar
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= 2. DROPDOWNS DE TARJETAS EXPANDIBLES (ESCRITORIO) ================= */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            key={activeDropdown}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseLeave={() => setActiveDropdown(null)}
            className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-2xl shadow-black/90 z-40 overflow-hidden"
          >
            {/* DROPDOWN 1: CLASES & HORARIOS */}
            {activeDropdown === 'clases' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Cronograma de Entrenamiento e²²
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      onHorariosClick();
                    }}
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    <span>Ver detalle completo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/40 transition group">
                    <div className="w-7 h-7 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition-transform">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-white">Musculación Libre</h5>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Lunes a Viernes 07:00 a 22:00hs y Sábados 09:00 a 14:00hs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/40 transition group">
                    <div className="w-7 h-7 rounded-xl bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-2.5 group-hover:scale-110 transition-transform">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-white">Funcional & Core</h5>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Turnos guiados por profesor: 08:00, 15:00 y 19:30hs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/40 transition group">
                    <div className="w-7 h-7 rounded-xl bg-violet-950/80 border border-violet-800/40 flex items-center justify-center text-violet-400 mb-2.5 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h5 className="text-xs font-bold text-white">Coach Virtual IA</h5>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Consulta en vivo tu rutina y dudas técnicas desde la app 24/7.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DROPDOWN 2: MEMBRESÍAS & TARIFAS */}
            {activeDropdown === 'membresias' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Tarifas Vigentes y Membresía
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    SIN COSTO DE MATRÍCULA
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-emerald-500/30 relative overflow-hidden">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50 block w-max mb-2">
                      PLAN PRINCIPAL
                    </span>
                    <p className="text-[11px] font-bold text-zinc-300">Cuota Mensual</p>
                    <p className="text-xl font-black text-white font-mono mt-1">
                      ${cuotaValor} <span className="text-[10px] font-normal text-zinc-400">/mes</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-2 leading-tight">
                      Acceso total, prescripción técnica de rutina y seguimiento.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Pase Diario</p>
                      <p className="text-sm font-bold font-mono text-white mt-0.5">
                        ${Number(configuracion?.precios?.pase_diario || 3500).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-1.5">
                      <p className="text-[10px] uppercase font-bold text-zinc-400">Pase Semanal</p>
                      <p className="text-sm font-bold font-mono text-white mt-0.5">
                        ${Number(configuracion?.precios?.pase_semanal || 12000).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Transferencias</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Alias oficial: <strong className="text-white font-mono block mt-0.5">{configuracion?.datos_bancarios?.alias || 'E22.GYM.FIT'}</strong>
                    </p>
                    <p className="text-[9px] text-zinc-500 font-mono">
                      Notificación y acreditación inmediata en tu perfil.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DROPDOWN 3: CENTRO E22 */}
            {activeDropdown === 'centro' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Centro de Alto Rendimiento e²²
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Instalaciones Premium
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                    <p className="font-bold text-white mb-1">Tecnología de Rutinas</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Planillas digitales por días, cálculo automático de series, repeticiones efectivas y RIR.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                    <p className="font-bold text-white mb-1">Sobrecarga Progresiva</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Registro de pesos históricos y gráficos interactivos para maximizar hipertrofia y fuerza.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                    <p className="font-bold text-white mb-1">Comunidad & Soporte</p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Entrenadores en sala para corrección de postura y control de técnica de levantamiento.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Sede Oficial: <strong>Javier de la Rosa 142, Santa Fe</strong></span>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/RMHyKSk7tSXdnpEt6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/50 transition font-mono"
                  >
                    <span>Ver en Google Maps</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 3. MENÚ EXPANDIBLE MÓVIL (GLASS CARD) ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onHorariosClick();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/70 border border-white/5 text-xs font-bold text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Ver Horarios & Clases</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('quienes-somos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/70 border border-white/5 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>¿Quiénes Somos?</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('ubicacion');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/70 border border-white/5 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Ubicación (Javier de la Rosa 142)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <div className="p-3 rounded-2xl bg-zinc-900/70 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">Cuota Mensual</span>
                </div>
                <span className="font-mono font-black text-white">${cuotaValor}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignInClick();
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-white"
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRegisterClick();
                }}
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-black"
              >
                Registrarse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
