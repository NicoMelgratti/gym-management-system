'use client';

import RouteGuard from '@/components/RouteGuard';
import AICoachWidget from '@/components/AICoachWidget';

export default function DashboardLayout({ children }) {
  return (
    <RouteGuard>
      {children}
      <AICoachWidget />
    </RouteGuard>
  );
}
