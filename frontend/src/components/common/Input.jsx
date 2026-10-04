import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  required,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>{label} {required && <span className="text-blue-400">*</span>}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full bg-[#111726] border text-sm text-slate-100 placeholder-slate-500 rounded-lg py-2.5 transition-all outline-none ${
            Icon ? 'pl-9 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
              : 'border-[#26334a] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 hover:border-[#3b4d6b]'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-400 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
