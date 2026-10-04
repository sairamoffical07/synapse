import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  BrainCircuit,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Materials', path: '/materials', icon: FolderKanban },
    { label: 'AI Assistant', path: '/chat', icon: Bot },
    { label: 'Practice', path: '/practice', icon: BrainCircuit },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b0f17] border-r border-[#1f293d] w-64 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1f293d] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm border border-blue-400/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wider text-slate-100 uppercase">SYNAPSE</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">KNOWLEDGE, CONNECTED.</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Profile & Footer Action */}
      <div className="p-3 border-t border-[#1f293d] space-y-1">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            location.pathname === '/profile'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111726]'
          }`}
        >
          <User className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col truncate flex-1">
            <span className="truncate text-slate-200">{user?.name || 'Account'}</span>
            <span className="text-[10px] text-slate-400 truncate">{user?.email || 'Student'}</span>
          </div>
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 max-w-xs h-full animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
