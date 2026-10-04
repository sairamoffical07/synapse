import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onOpenMobile }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Study Overview';
      case '/materials': return 'Study Materials Library';
      case '/chat': return 'Synapse AI Assistant';
      case '/practice': return 'Active Revision & Practice';
      case '/profile': return 'Student Profile';
      default: return 'Synapse Workspace';
    }
  };

  return (
    <header className="h-14 border-b border-[#1f293d] bg-[#0b0f17]/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#182032]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-semibold text-slate-200 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111726] border border-[#26334a] text-xs text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-medium text-slate-300">Gemini Grounded RAG</span>
        </div>

        <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-400">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'S'}
        </div>
      </div>
    </header>
  );
};
