'use client';

import React, { useEffect } from 'react';
import { TopHeaderBar } from '@/components/TopHeaderBar';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { DailySpinModal } from '@/components/DailySpinModal';
import { BackgroundParticles } from '@/components/BackgroundParticles';
import { useAppStore } from '@/store/useAppStore';

interface AppDashboardLayoutProps {
  children: React.ReactNode;
}

export function AppDashboardLayout({ children }: AppDashboardLayoutProps) {
  const initAuthListener = useAppStore((state) => state.initAuthListener);

  useEffect(() => {
    const unsub = initAuthListener();
    return () => {
      if (unsub) unsub();
    };
  }, [initAuthListener]);

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex flex-col font-body selection:bg-primary-container selection:text-white relative overflow-x-hidden antialiased">
      {/* Dynamic Cyber Light Gradients from Stitch Redesign */}
      <div className="fixed -top-32 left-1/4 w-[600px] h-[600px] bg-primary-container/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[600px] -right-20 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[600px] h-[600px] bg-tertiary-container/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <BackgroundParticles />

      {/* Pinned Top Navigation Bar */}
      <TopHeaderBar />

      {/* Main Full-Width Content Area */}
      <main className="flex-1 w-full pt-20 bg-background min-h-screen">
        <div className="flex flex-col w-full relative">
          {children}
          <Footer />
        </div>
      </main>

      {/* Global Modals */}
      <AuthModal />
      <DailySpinModal />
    </div>
  );
}
