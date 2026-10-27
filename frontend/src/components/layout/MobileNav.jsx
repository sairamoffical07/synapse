import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, UploadCloud, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { navItems } from './navItems';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 h-12 px-3.5 rounded-lg border-2 text-base font-bold transition-colors ${
    isActive ? 'bg-black border-black text-yellow' : 'border-black bg-white text-black hover:bg-sage'
  }`;

// Slide-in navigation for tablet and mobile, where the header has no room for every route.
export const MobileNav = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="fixed inset-0 bg-charcoal/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="relative z-10 h-full w-80 max-w-[85vw] flex flex-col bg-white border-r-2 border-black animate-fade-in"
      >
        <div className="h-16 px-4 flex items-center justify-between bg-yellow border-b-2 border-black">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg border-2 border-black bg-white shadow-brut press"
          >
            <X className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2.5">
            {navItems.map(({ label, path, icon: Icon, end }) => (
              <li key={path}>
                <NavLink to={path} end={end} onClick={onClose} className={linkClass}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/profile" onClick={onClose} className={linkClass}>
                <User className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                Profile
              </NavLink>
            </li>
          </ul>

          <NavLink
            to="/materials"
            onClick={onClose}
            className="mt-6 flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-black bg-charcoal text-white font-bold shadow-brut press"
          >
            <UploadCloud className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            Upload material
          </NavLink>
        </nav>

        <div className="p-4 border-t-2 border-black bg-sage">
          <p className="text-sm font-bold text-black truncate">{user?.name || 'Account'}</p>
          <p className="text-[13px] text-gray-700 truncate mb-3">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-black bg-white text-black font-bold hover:bg-charcoal hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
