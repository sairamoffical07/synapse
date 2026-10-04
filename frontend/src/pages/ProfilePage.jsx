import React from 'react';
import { User, Mail, GraduationCap, BookOpen, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-slate-100">Student Profile</h2>
        <p className="text-xs text-slate-400">Account metadata and workspace authentication details.</p>
      </div>

      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-[#1f293d]">
          <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-blue-400">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-100">{user?.name || 'Student Account'}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {user?.email || 'authenticated@synapse.edu'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Workspace Configuration
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#182032] border border-[#26334a] flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400">University</span>
                <span className="font-medium text-slate-200">Synapse Academic Network</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#182032] border border-[#26334a] flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400">Status</span>
                <span className="font-medium text-slate-200">Active Student Member</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#182032] border border-[#26334a] flex items-center gap-2.5 sm:col-span-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400">Security Mode</span>
                <span className="font-medium text-slate-200">JWT Authenticated • User-Isolated ChromaDB Vector Scope</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1f293d] flex justify-end">
          <Button variant="danger" size="sm" icon={LogOut} onClick={logout}>
            Sign Out of Synapse
          </Button>
        </div>
      </div>
    </div>
  );
};
