'use client';

import { useState, useEffect } from 'react';
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
  Eye,
  EyeOff,
  Sparkles,
  Activity,
  Clock,
  DollarSign,
  X,
  Home,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import Stepper, { Step } from '@/components/Stepper';
import MaskedHeading from '@/components/MaskedHeading';
import Navigation2 from '@/components/Navigation2';
import LiquidGlassNav from '@/components/LiquidGlassNav';

export default function AccessPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  const [showHorariosModal, setShowHorariosModal] = useState(false);
  const [configuracion, setConfiguracion] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('Javier de la Rosa 142, Santa Fe, Argentina');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  useEffect(() => {
    fetch('/api/configuracion')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.configuracion) {
          setConfiguracion(data.configuracion);
        }
      })
      .catch((err) => console.error('Error fetching config on landing:', err));
  }, []);

  // Ítems para barra móvil inferior Liquid Glass
  const landingMobileItems = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: Home,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      isActive: true,
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      icon: Users,
      onClick: () => {
        const el = document.getElementById('quienes-somos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      isActive: false,
    },
    {
      id: 'ubicacion',
      label: 'Ubicación',
      icon: MapPin,
      onClick: () => {
        const el = document.getElementById('ubicacion');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
      isActive: false,
    },
    {
      id: 'horarios',
      label: 'Horarios',
      icon: Clock,
      onClick: () => setShowHorariosModal(true),
      isActive: showHorariosModal,
    },
    {
      id: 'ingreso',
      label: 'Ingresar',
      icon: User,
      onClick: () => {
        setActiveTab('signin');
        const formEl = document.getElementById('auth-form-card');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      },
      isActive: activeTab === 'signin' && !showHorariosModal,
    },
  ];

  // Formulario Sign In
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  // Formulario Registro por Pasos
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
  const [showPassword, setShowPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
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

  // Validación de pasos del Stepper
  const handleValidateStep = (stepNumber) => {
    setErrorRegister('');
    if (stepNumber === 1) {
      if (!formData.nombre.trim()) {
        setErrorRegister('Por favor ingresa tu nombre para continuar.');
        return false;
      }
      if (!formData.dni.trim() || formData.dni.trim().length < 6) {
        setErrorRegister('Por favor ingresa un número de DNI válido (mínimo 6 dígitos).');
        return false;
      }
      return true;
    }

    if (stepNumber === 2) {
      if (!formData.password.trim() || formData.password.trim().length < 4) {
        setErrorRegister('Por favor crea una contraseña de al menos 4 caracteres.');
        return false;
      }
      return true;
    }

    return true;
  };

  // Manejar Registro Final
  const handleRegister = async () => {
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

      setSuccessRegister('¡Registro completado con éxito! Ingresando a tu portal de socio...');
      localStorage.setItem('e22_user', JSON.stringify(data.user));

      setTimeout(() => {
        router.push('/dashboard/alumno');
      }, 900);
    } catch (err) {
      setErrorRegister(err.message);
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col font-sans selection:bg-white selection:text-black relative">
      {/* 1. NAVEGADOR SUPERIOR CENTRADO CON GLASS EFFECT Y DROPDOWNS EXPANDIBLES (NAVIGATION 2) */}
      <Navigation2
        onSignInClick={() => {
          setActiveTab('signin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRegisterClick={() => {
          setActiveTab('register');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onHorariosClick={() => setShowHorariosModal(true)}
        configuracion={configuracion}
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col w-full">
        {/* ÁREA HERO + FORMULARIO */}
        <section id="inicio" className="flex flex-col xl:flex-row items-center justify-center px-4 sm:px-8 lg:px-12 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 gap-8 lg:gap-16 max-w-6xl w-full mx-auto">
        {/* HERO BRANDING */}
        <div id="hero-branding" className="max-w-md w-full space-y-4 text-center xl:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-e22-surface border border-e22-border rounded-full text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CENTRO DE ALTO RENDIMIENTO</span>
          </div>

          <div className="space-y-1">
            <MaskedHeading
              text="E22 GYM"
              src="/gym-hero.png"
              fillScale={1.35}
              parallax={32}
              drift={16}
              reveal="rise"
              trigger="view"
              weight={900}
              textScale={0.22}
              align="inherit"
              className="tracking-tight leading-none drop-shadow-2xl"
            />
            <h1 className="text-xl sm:text-2xl font-black tracking-widest text-zinc-400 font-mono">
              TRAINING MANAGEMENT
            </h1>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed font-sans">
            Plataforma oficial de control de membresías, prescripción técnica de rutinas por días, seguimiento de sobrecarga progresiva y asistencia de <strong>E22 GYM</strong>.
          </p>

          {/* Métricas rápidas dinámicas */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-e22-border">
            <div>
              <p className="text-base sm:text-xl font-black text-white tracking-tight">07 - 22hs</p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5">Musculación</p>
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-white tracking-tight">
                ${Number(configuracion?.precios?.cuota_mensual || 25000).toLocaleString('es-AR')}
              </p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5">Cuota / Mes</p>
            </div>
            <div>
              <p className="text-base sm:text-xl font-black text-emerald-400 tracking-tight">100%</p>
              <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5">Enfoque Elite</p>
            </div>
          </div>

          {/* Botón interactivo para ver cronograma y tarifas */}
          <div className="pt-2 flex items-center justify-center xl:justify-start gap-3">
            <button
              type="button"
              onClick={() => setShowHorariosModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl text-xs font-bold text-zinc-200 hover:text-white transition shadow-lg group"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <span>Ver Horarios de Clases & Tarifas</span>
            </button>
          </div>
        </div>

        {/* 3. TARJETA DE ACCESO / REGISTRO DERECHA */}
        <div id="auth-form-card" className={`w-full ${activeTab === 'register' ? 'max-w-lg' : 'max-w-md'} bg-e22-card border border-e22-border rounded-2xl p-4 sm:p-7 shadow-2xl space-y-5 transition-all duration-300`}>
          {/* Pestañas SIGN IN / REGISTER */}
          <div className="flex bg-e22-bg p-1 rounded-xl border border-e22-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorRegister('');
                setSuccessRegister('');
              }}
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
              onClick={() => {
                setActiveTab('register');
                setErrorLogin('');
              }}
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
                    placeholder="Tu DNI o usuario"
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
                  <span className="text-[10px] text-zinc-500 font-mono">Seguridad E22</span>
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
                {loadingLogin ? 'AUTORIZANDO...' : 'INGRESAR AL SISTEMA'}
              </button>

              <div className="pt-3 text-center">
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  SISTEMA PRIVADO // CREDENCIALES REGISTRADAS REQUERIDAS
                </p>
              </div>
            </form>
          )}

          {/* ================= FORMULARIO REGISTER CON STEPPER ================= */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  NUEVO SOCIO // ENROLAMIENTO POR PASOS
                </span>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Registro de Cliente E22
                </h3>
              </div>

              {errorRegister && (
                <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-2 text-xs text-red-400 font-mono animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorRegister}</span>
                </div>
              )}

              {successRegister && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-mono animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successRegister}</span>
                </div>
              )}

              <Stepper
                initialStep={1}
                canAdvanceStep={handleValidateStep}
                onStepChange={(step) => {
                  setRegisterStep(step);
                  setErrorRegister('');
                }}
                onFinalStepCompleted={() => {
                  handleRegister();
                }}
                backButtonText="Anterior"
                nextButtonText="Siguiente Paso"
                completeButtonText={loadingRegister ? 'Enrolando...' : 'Completar Registro'}
                nextButtonProps={{ disabled: loadingRegister }}
                backButtonProps={{ disabled: loadingRegister }}
              >
                {/* PASO 1: Identidad Deportiva */}
                <Step>
                  <div className="space-y-3.5">
                    <div className="border-b border-zinc-800 pb-2 mb-3">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        Paso 1: Identidad Deportiva
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Ingresa tus datos personales y documento nacional de identidad.
                      </p>
                    </div>

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
                          className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 transition"
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
                          className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                        <span>DNI (Tu usuario de ingreso) *</span>
                        <span className="text-[9px] font-mono text-zinc-500">Sin puntos</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        placeholder="Ej: 42893102"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-400 transition"
                      />
                    </div>

                    <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-start gap-2 text-[10px] text-zinc-400 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-300 shrink-0 mt-0.5" />
                      <span>Tu DNI será la credencial exclusiva para ingresar a tus rutinas y estado de cuota.</span>
                    </div>
                  </div>
                </Step>

                {/* PASO 2: Contacto y Seguridad */}
                <Step>
                  <div className="space-y-3.5">
                    <div className="border-b border-zinc-800 pb-2 mb-3">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        Paso 2: Contacto & Credenciales
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Configura tu vía de comunicación y contraseña de acceso.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="+54 9 11 2345-6789"
                          className="w-full bg-e22-bg border border-e22-border rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Email (Opcional)
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="socio@email.com"
                          className="w-full bg-e22-bg border border-e22-border rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-400 transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Contraseña Personal *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full bg-e22-bg border border-e22-border rounded-xl pl-9 pr-10 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-400 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </Step>

                {/* PASO 3: Ficha Médica & Asistencia */}
                <Step>
                  <div className="space-y-3.5">
                    <div className="border-b border-zinc-800 pb-2 mb-3">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-zinc-400" />
                        Paso 3: Ficha Médica & Frecuencia
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Permite que el entrenador programe tu entrenamiento cuidando tu salud.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Alergias Conocidas
                      </label>
                      <input
                        type="text"
                        value={formData.alergias}
                        onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                        placeholder="Ej: Ninguna, o detalla alergias"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Patologías / Lesiones Preexistentes
                      </label>
                      <input
                        type="text"
                        value={formData.patologias}
                        onChange={(e) => setFormData({ ...formData, patologias: e.target.value })}
                        placeholder="Ej: Molestia lumbar, o 'Ninguna'"
                        className="w-full bg-e22-bg border border-e22-border rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Frecuencia Semanal Estimada
                      </label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setFormData({ ...formData, dias_asistencia: num })}
                            className={`py-2 text-xs font-mono font-bold rounded-lg border transition ${
                              formData.dias_asistencia === num
                                ? 'bg-white text-zinc-950 border-white shadow'
                                : 'bg-e22-bg text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                            }`}
                          >
                            {num}d
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 text-center">
                        {formData.dias_asistencia} días por semana estimados
                      </p>
                    </div>
                  </div>
                </Step>

                {/* PASO 4: Resumen y Confirmación */}
                <Step>
                  <div className="space-y-3.5">
                    <div className="border-b border-zinc-800 pb-2 mb-3">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Paso 4: Resumen de Enrolamiento
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Verifica tus datos antes de activar tu perfil de socio en E22 GYM.
                      </p>
                    </div>

                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2.5 text-xs font-mono">
                      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                        <span className="text-zinc-500 text-[11px]">Socio:</span>
                        <span className="text-white font-bold">{formData.nombre} {formData.apellido}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                        <span className="text-zinc-500 text-[11px]">DNI / Usuario:</span>
                        <span className="text-white font-bold">{formData.dni}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                        <span className="text-zinc-500 text-[11px]">Contacto:</span>
                        <span className="text-zinc-300">{formData.telefono || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
                        <span className="text-zinc-500 text-[11px]">Frecuencia:</span>
                        <span className="text-zinc-300">{formData.dias_asistencia} días / semana</span>
                      </div>
                      <div className="flex justify-between items-start pt-0.5 text-[11px]">
                        <span className="text-zinc-500">Salud:</span>
                        <span className="text-zinc-300 text-right max-w-[200px] truncate">
                          {formData.patologias || 'Ninguna declarada'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Al completar el registro accederás de inmediato a tu panel oficial.</span>
                    </div>
                  </div>
                </Step>
              </Stepper>
            </div>
          )}
        </div>
        </section>

        {/* ================= 3. SECCIÓN ¿QUIÉNES SOMOS? ================= */}
        <section id="quienes-somos" className="w-full px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-zinc-800/80 relative overflow-hidden bg-gradient-to-b from-transparent via-zinc-950/60 to-transparent">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto space-y-10 sm:space-y-14 relative z-10">
            {/* Header de Sección con tipografía potente inspirada en la imagen */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] sm:text-xs font-mono tracking-widest uppercase text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>NUESTRA ESENCIA // FILOSOFÍA E22</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-sans">
                ¿QUIÉNES SOMOS?
              </h2>
              <div className="w-20 h-1 bg-white mx-auto rounded-full mt-2" />
            </div>

            {/* Tarjeta de Manifiesto Principal con el contenido exacto de la imagen */}
            <div className="relative rounded-3xl bg-zinc-950/85 border border-zinc-800 p-6 sm:p-12 md:p-16 shadow-2xl backdrop-blur-2xl">
              <div className="max-w-2xl mx-auto text-center space-y-8 sm:space-y-10">
                <p className="text-base sm:text-xl lg:text-2xl font-medium text-zinc-100 leading-relaxed font-sans">
                  Somos un gimnasio comprometido con tu bienestar integral, dedicados a promover una vida más saludable y activa.
                </p>

                <div className="w-16 h-px bg-zinc-800 mx-auto" />

                <p className="text-base sm:text-xl lg:text-2xl font-medium text-zinc-100 leading-relaxed font-sans">
                  Nuestro enfoque va más allá del ejercicio físico: ofrecemos un ambiente acogedor y programas diseñados para mejorar tu calidad de vida, tanto física como mental.
                </p>

                <div className="w-16 h-px bg-zinc-800 mx-auto" />

                <p className="text-base sm:text-xl lg:text-2xl font-medium text-zinc-100 leading-relaxed font-sans">
                  Vení a entrenar con nosotros y descubrí cómo alcanzar tus metas de salud y bienestar de manera sostenible y efectiva.
                </p>

                {/* Logo E22 idéntico al pie de la imagen compartida */}
                <div className="pt-6 sm:pt-10 flex flex-col items-center justify-center gap-3">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 bg-black shadow-2xl p-2 group hover:border-white transition-all duration-300">
                    <Image
                      src="/logo.png"
                      alt="E22 Gym Logo"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
                    E22 GYM TRAINING CENTER
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      const formEl = document.getElementById('auth-form-card');
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg hover:scale-105"
                  >
                    <span>Sumate al equipo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Pilares destacados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Bienestar Integral</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Salud, vitalidad y rendimiento en equilibrio, adaptados a tu ritmo y objetivos personales.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Física & Mental</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Un entorno estimulante donde entrenar la disciplina, liberar tensiones y potenciar tu energía diaria.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Progreso Sostenible</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Metodología basada en sobrecarga progresiva real, sin atajos perjudiciales, cuidando cada articulación.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. SECCIÓN UBICACIÓN ================= */}
        <section id="ubicacion" className="w-full px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-zinc-800/80 relative">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
            {/* Header de Sección */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] sm:text-xs font-mono tracking-widest uppercase text-emerald-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>SEDE OFICIAL // SANTA FE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans">
                NUESTRA UBICACIÓN
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                Javier de la Rosa 142, Santa Fe, Argentina
              </p>
            </div>

            {/* Grilla: Info Card + Mapa */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Tarjeta de Información y Acciones */}
              <div className="lg:col-span-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl backdrop-blur-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-tight">
                        Gimnasio E22
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">Centro de Entrenamiento</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">
                      Dirección Oficial
                    </span>
                    <p className="text-sm font-bold text-white">
                      Javier de la Rosa 142
                    </p>
                    <p className="text-xs text-zinc-400">
                      Santa Fe, Provincia de Santa Fe, Argentina
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                      <span className="text-zinc-400">Lunes a Viernes</span>
                      <span className="font-mono font-bold text-emerald-400">07:00 a 22:00 hs</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                      <span className="text-zinc-400">Sábados</span>
                      <span className="font-mono font-bold text-emerald-400">09:00 a 14:00 hs</span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href="https://maps.app.goo.gl/RMHyKSk7tSXdnpEt6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-xl group"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-950 transition-colors" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-xs font-bold text-zinc-300 hover:text-white transition font-mono"
                  >
                    {copiedAddress ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Dirección Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copiar Dirección</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mapa interactivo embebido */}
              <div className="lg:col-span-7 rounded-3xl bg-zinc-950/80 border border-zinc-800 overflow-hidden shadow-2xl relative min-h-[320px] sm:min-h-[420px] flex flex-col">
                <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    Mapa en vivo // Santa Fe
                  </span>
                  <a
                    href="https://maps.app.goo.gl/RMHyKSk7tSXdnpEt6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                  >
                    <span>Cómo llegar</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <iframe
                  title="Ubicación Gimnasio E22"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-60.672,-31.609,-60.660,-31.600&layer=mapnik&marker=-31.6046906,-60.6662281"
                  className="w-full flex-1 min-h-[300px] border-0 grayscale contrast-125 opacity-90 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5. FOOTER ================= */}
        <footer className="w-full border-t border-zinc-900 bg-black/60 py-12 px-4 sm:px-8 pb-32 sm:pb-24 text-center text-xs text-zinc-500 font-mono">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                <Image src="/logo.png" alt="E22 Gym" fill className="object-cover" />
              </div>
              <span className="font-black text-white tracking-widest text-sm font-sans">E22 GYM</span>
            </div>
            <p className="text-zinc-400 text-xs font-sans max-w-md mx-auto">
              Centro de Alto Rendimiento, bienestar integral y gestión deportiva.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-zinc-400 pt-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-white transition"
              >
                Inicio
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('quienes-somos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition"
              >
                ¿Quiénes Somos?
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('ubicacion');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition"
              >
                Ubicación
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowHorariosModal(true)}
                className="hover:text-white transition"
              >
                Horarios & Tarifas
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 pt-4">
              © {new Date().getFullYear()} E22 GYM. Todos los derechos reservados. Javier de la Rosa 142, Santa Fe.
            </p>
          </div>
        </footer>

        {/* Modal de Horarios & Tarifas */}
        {showHorariosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowHorariosModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
              aria-hidden="true"
            />

            <div className="relative w-full max-w-xl bg-e22-card border border-zinc-700 rounded-3xl p-6 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      Horarios & Tarifas Oficiales
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">E22 GYM TRAINING CENTER</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHorariosModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Horarios */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Días y Horarios de Apertura
                </h4>
                <div className="space-y-2">
                  {(configuracion?.horarios || [
                    { dia: 'Lunes a Viernes', apertura: '07:00', cierre: '22:00', turnos: 'Musculación continua y clases funcionales' },
                    { dia: 'Sábados', apertura: '09:00', cierre: '14:00', turnos: 'Open Gym y acondicionamiento' },
                    { dia: 'Domingos y Feriados', apertura: 'Cerrado', cierre: '', turnos: 'Descanso muscular' },
                  ]).map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-e22-bg border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{h.dia}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {h.apertura === 'Cerrado' ? 'Cerrado' : `${h.apertura} a ${h.cierre}`}
                        </span>
                      </div>
                      {h.turnos && (
                        <p className="text-[11px] text-zinc-400 font-sans leading-tight">{h.turnos}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarifas */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tarifas Vigentes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-e22-bg border border-zinc-800 text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Cuota Mensual</p>
                    <p className="text-base font-black font-mono text-white mt-0.5">
                      ${Number(configuracion?.precios?.cuota_mensual || 25000).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-e22-bg border border-zinc-800 text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Pase Semanal</p>
                    <p className="text-base font-black font-mono text-white mt-0.5">
                      ${Number(configuracion?.precios?.pase_semanal || 12000).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-e22-bg border border-zinc-800 text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Pase Diario</p>
                    <p className="text-base font-black font-mono text-white mt-0.5">
                      ${Number(configuracion?.precios?.pase_diario || 3500).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                {configuracion?.precios?.descripcion && (
                  <p className="text-[11px] text-zinc-400 italic pt-1">
                    {configuracion.precios.descripcion}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHorariosModal(false)}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Entendido, Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. BARRA INFERIOR MÓVIL LIQUID GLASS ESTILO APPLE / INSTAGRAM */}
      <LiquidGlassNav items={landingMobileItems} />
    </div>
  );
}
