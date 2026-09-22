'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle } from 'lucide-react';

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zinerva_user');
      localStorage.removeItem('e22_user');
    }
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo E22 */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black border border-slate-700 shadow-md group-hover:border-rose-500 transition">
            <Image
              src="/logo.png"
              alt="E22 Gym Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="text-xl font-black tracking-widest text-white">
              E22 <span className="text-rose-500">GYM</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">
              Centro de Entrenamiento
            </span>
          </div>
        </Link>

        {/* Datos de usuario y Logout */}
        {user && (
          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex items-center gap-2.5 text-right">
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  {user.nombre_completo || user.nombre}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">DNI: {user.dni}</p>
              </div>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${
                  user.rol_nombre === 'profesor'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {user.rol_nombre || 'Socio'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
