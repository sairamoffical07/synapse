import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

const pageTitles = {
  '/': 'Dashboard',
  '/materials': 'Library',
  '/chat': 'Ask Synapse',
  '/practice': 'Practice',
  '/profile': 'Profile',
};

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname];
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    document.title = title ? `${title} · Synapse` : 'Synapse';
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-charcoal">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:border-2 focus:border-black focus:bg-white focus:font-bold focus:shadow-brut"
      >
        Skip to content
      </a>

      <Header onOpenMobile={() => setMobileOpen(true)} />
      <MobileNav isOpen={mobileOpen} onClose={closeMobile} />

      <main
        id="main"
        key={location.pathname}
        className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:py-12 animate-fade-in"
      >
        <Outlet />
      </main>
    </div>
  );
};
