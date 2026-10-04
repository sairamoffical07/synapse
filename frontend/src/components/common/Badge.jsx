import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const Badge = ({ status, className = '' }) => {
  const normStatus = (status || '').toUpperCase();

  const configs = {
    COMPLETED: {
      label: 'Processed',
      icon: CheckCircle2,
      style: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
    },
    PROCESSING: {
      label: 'Analyzing',
      icon: Clock,
      style: 'bg-amber-950/40 text-amber-400 border-amber-800/40 animate-pulse-glow',
    },
    FAILED: {
      label: 'Failed',
      icon: AlertCircle,
      style: 'bg-red-950/40 text-red-400 border-red-800/40',
    },
  };

  const config = configs[normStatus] || {
    label: normStatus || 'Unknown',
    icon: Clock,
    style: 'bg-slate-900 text-slate-400 border-slate-700',
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.style} ${className}`}>
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
