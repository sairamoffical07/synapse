import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { navItems } from './navItems';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border-2 text-[15px] font-bold transition-colors ${
    isActive
      ? 'bg-black border-black text-yellow'
      : 'border-transparent text-black hover:bg-white hover:border-black'
  }`;

// Yellow app bar: brand, workspace routes, the primary upload action and account controls.
export const Header = ({ onOpenMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'S';

  return (
    <header className="sticky top-0 z-30 bg-yellow border-b-2 border-black">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onOpenMobile}
            aria-label="Open navigation"
            className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-brut press"
          >
            <Menu className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
          <Link to="/" aria-label="Synapse dashboard" className="rounded-lg ml-1 lg:ml-0">
            <Logo />
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map(({ label, path, icon: Icon, end }) => (
              <li key={path}>
                <NavLink to={path} end={end} className={navLinkClass}>
                  <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="dark"
            size="sm"
            icon={UploadCloud}
            className="hidden sm:inline-flex"
            onClick={() => navigate('/materials')}
          >
            Upload
          </Button>
          <NavLink
            to="/profile"
            aria-label="Your profile"
            title={user?.email}
            className={({ isActive }) =>
              `w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center font-display text-lg font-extrabold transition-colors ${
                isActive ? 'bg-black text-yellow' : 'bg-sage text-black hover:bg-white'
              }`
            }
          >
            {initial}
          </NavLink>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="hidden lg:inline-flex w-10 h-10 items-center justify-center rounded-lg border-2 border-transparent text-black hover:border-black hover:bg-white transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
