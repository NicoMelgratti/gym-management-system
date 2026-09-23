'use client';

import RouteGuard from '@/components/RouteGuard';

export default function DashboardLayout({ children }) {
  return <RouteGuard>{children}</RouteGuard>;
}
