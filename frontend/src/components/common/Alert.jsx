import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

// Without extra accent colors, each variant pairs a distinct icon block and label with a palette fill.
const variants = {
  error: { icon: AlertCircle, label: 'Error', block: 'bg-charcoal text-yellow', body: 'bg-white', role: 'alert' },
  success: { icon: CheckCircle2, label: 'Done', block: 'bg-black text-sage', body: 'bg-sage', role: 'status' },
  info: { icon: Info, label: 'Note', block: 'bg-black text-yellow', body: 'bg-yellow', role: 'status' },
};

// Inline notification used for request errors and confirmations.
export const Alert = ({ variant = 'error', children, onDismiss, className = '' }) => {
  const { icon: Icon, label, block, body, role } = variants[variant];

  return (
    <div role={role} className={`flex items-stretch rounded-lg border-2 border-black shadow-brut overflow-hidden animate-fade-in ${body} ${className}`}>
      <div className={`flex items-center px-3 shrink-0 ${block}`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0 px-3.5 py-2.5 text-[15px] text-black break-words leading-snug">
        <span className="font-bold mr-1.5">{label}:</span>
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="px-3 shrink-0 border-l-2 border-black text-black hover:bg-black hover:text-white transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
