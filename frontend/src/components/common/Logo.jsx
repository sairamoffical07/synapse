import React from 'react';

// Black square mark with a yellow "connected nodes" symbol: three ideas joined into one.
export const LogoMark = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={`shrink-0 ${className}`}>
    <rect width="32" height="32" className="fill-black" />
    <path d="M9.5 22 16 10l6.5 12H9.5Z" className="stroke-yellow" strokeWidth="2.5" strokeLinejoin="round" />
    <rect x="13" y="7" width="6" height="6" className="fill-yellow" />
    <rect x="6.5" y="19" width="6" height="6" className="fill-yellow" />
    <rect x="19.5" y="19" width="6" height="6" className="fill-yellow" />
  </svg>
);

export const Logo = ({ className = '', tone = 'dark' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark />
    <span className={`font-display text-2xl font-extrabold tracking-tight leading-none ${tone === 'light' ? 'text-white' : 'text-black'}`}>
      Synapse
    </span>
  </div>
);
