import React from 'react';

// Consistent page title block: tag-style eyebrow, heavy display title, supporting copy, optional actions.
export const PageHeader = ({ eyebrow, title, description, actions, className = '' }) => (
  <header className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${className}`}>
    <div className="min-w-0 space-y-3">
      {eyebrow && (
        <p className="inline-block px-2 py-0.5 bg-sage border-2 border-black rounded-md text-[13px] font-bold uppercase tracking-wider text-black">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl sm:text-5xl leading-[1.05] text-black break-words">{title}</h1>
      {description && <p className="text-base sm:text-[17px] text-gray-700 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
  </header>
);
