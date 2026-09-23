'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Lock, AlertTriangle } from 'lucide-react';

export default function RouteGuard({ children, requiredRole }) {
  const router = useRouter();
  const pathname = usePathname();
  // status: 'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'
  const [status, setStatus] = useState('loading');
  const [deniedMessage, setDeniedMessage] = useState('');

  useEffect(() => {
    // 1. Verificar si hay usuario guardado en localStorage
    const saved = typeof window !== 'undefined' ? localStorage.getItem('e22_user') : null;
    if (!saved) {
      setStatus('unauthenticated');
      // Limpiar cookie si existiera residual
      if (typeof document !== 'undefined') {
        document.cookie = 'e22_role=; path=/; max-age=0;';
      }
      router.replace('/');
      return;
    }

    try {
      const user = JSON.parse(saved);
      if (!user || !user.id) {
        throw new Error('Sesión corrupta o inválida');
      }

      const isProfesor = user.rol === 'profesor' || user.rol === 'admin';
      const userRole = isProfesor ? 'profesor' : 'alumno';

      // Sincronizar cookie de sesión para middleware
      if (typeof document !== 'undefined') {
        document.cookie = `e22_role=${userRole}; path=/; max-age=2592000; SameSite=Lax`;
      }

      // 2. Verificar rol requerido
      if (requiredRole === 'profesor' && !isProfesor) {
        setStatus('unauthorized');
        setDeniedMessage('Acceso restringido: Este panel es exclusivo para profesores.');
        router.replace('/dashboard/alumno');
        return;
      }

      if (requiredRole === 'alumno' && isProfesor) {
        setStatus('unauthorized');
        setDeniedMessage('Redirigiendo a tu panel de profesor...');
        router.replace('/dashboard/profesor');
        return;
      }

      // 3. Usuario totalmente autorizado
      setStatus('authorized');
    } catch (err) {
      console.error('Error en validación de seguridad de sesión:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('e22_user');
      }
      if (typeof document !== 'undefined') {
        document.cookie = 'e22_role=; path=/; max-age=0;';
      }
      setStatus('unauthenticated');
      router.replace('/');
    }
  }, [pathname, requiredRole, router]);

  // Si está autorizado, renderizar el contenido protegido
  if (status === 'authorized') {
    return <>{children}</>;
  }

  // Pantalla de protección y verificación (evita cualquier render previo de datos protegidos)
  return (
    <div className="min-h-screen bg-e22-bg text-e22-text flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Resplandor ambiental de seguridad */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full bg-zinc-950/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Logotipo E22 HD */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black border border-white/20 mx-auto p-1.5 shadow-xl">
          <Image
            src="/logo.png"
            alt="E22 Gym"
            fill
            className="object-contain p-1"
            priority
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONTROL DE ACCESO E22</span>
          </div>

          <h3 className="text-base font-black text-white uppercase tracking-tight">
            {status === 'loading'
              ? 'Verificando Autorización'
              : status === 'unauthorized'
              ? 'Nivel de Rol Insuficiente'
              : 'Sesión Requerida'}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            {deniedMessage ||
              (status === 'loading'
                ? 'Comprobando credenciales y permisos de seguridad...'
                : 'Debes iniciar sesión para acceder a este dashboard. Redirigiendo...')}
          </p>
        </div>

        {/* Spinner animado */}
        <div className="flex justify-center pt-2">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}
