'use client';

import RouteGuard from '@/components/RouteGuard';

export default function ProfesorLayout({ children }) {
  return <RouteGuard requiredRole="profesor">{children}</RouteGuard>;
}
