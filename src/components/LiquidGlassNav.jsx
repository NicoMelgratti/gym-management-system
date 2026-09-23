'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

export default function LiquidGlassNav({
  items = [],
  className = '',
  onItemClick = () => {},
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación móvil"
      className={`lg:hidden fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[380px] ${className}`}
    >
      {/* Contenedor Cápsula Liquid Glass */}
      <div className="relative flex items-center justify-between p-1.5 rounded-full bg-black/65 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(0,0,0,0.6)]">
        {/* Reflejo de luz superior tipo cristal de Apple */}
        <div className="absolute inset-x-5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-full" />

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href;

          const content = (
            <div className="relative flex items-center justify-center w-full h-11 px-3">
              {/* Píldora activa deslizante estilo Apple / Instagram */}
              {isActive && (
                <motion.div
                  layoutId="liquidActiveIndicator"
                  className="absolute inset-0 rounded-full bg-white/20 border border-white/25 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-md"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}

              {/* Ícono */}
              <div
                className={`relative z-10 flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'text-white scale-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onItemClick(item)}
                className="flex-1 flex items-center justify-center focus:outline-none select-none active:scale-90 transition-transform"
                title={item.label}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.onClick) item.onClick();
                onItemClick(item);
              }}
              className="flex-1 flex items-center justify-center focus:outline-none select-none active:scale-90 transition-transform"
              title={item.label}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
