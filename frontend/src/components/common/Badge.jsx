import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

// Status is carried by icon + label first; fill color is a secondary cue.
export const Badge = ({ status, className = '' }) => {
  const normStatus = (status || '').toUpperCase();

  const configs = {
    COMPLETED: {
      label: 'Ready',
      icon: CheckCircle2,
      style: 'bg-sage text-black',
    },
    PROCESSING: {
      label: 'Analyzing',
      icon: Clock,
      style: 'bg-yellow text-black animate-soft-pulse',
    },
    FAILED: {
      label: 'Failed',
      icon: AlertCircle,
      style: 'bg-charcoal text-white',
    },
  };

  const config = configs[normStatus] || {
    label: normStatus || 'Unknown',
    icon: Clock,
    style: 'bg-white text-black',
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border-2 border-black text-[13px] font-bold whitespace-nowrap ${config.style} ${className}`}>
      <IconComponent className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
