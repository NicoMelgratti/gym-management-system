'use client';

import RouteGuard from '@/components/RouteGuard';

export default function AlumnoLayout({ children }) {
  return <RouteGuard requiredRole="alumno">{children}</RouteGuard>;
}
