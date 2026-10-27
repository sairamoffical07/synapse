import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

const fieldBase =
  'w-full h-11 bg-white border-2 border-black rounded-lg text-[15px] text-black font-medium outline-none transition-shadow ' +
  'focus:shadow-brut disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed';

// Errors get a heavier treatment (hard shadow + icon + message) instead of an extra color.
const fieldState = (error) => (error ? 'shadow-brut' : '');

const FieldShell = ({ label, inputId, required, error, helperText, children }) => (
  <div className="w-full flex flex-col gap-1.5">
    {label && (
      <label htmlFor={inputId} className="text-sm font-bold text-black">
        {label}
        {required && <span className="ml-0.5" aria-hidden="true">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p id={`${inputId}-msg`} className="flex items-center gap-1.5 text-sm font-bold text-black">
        <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
        {error}
      </p>
    ) : helperText ? (
      <p id={`${inputId}-msg`} className="text-[13px] text-gray-700">{helperText}</p>
    ) : null}
  </div>
);

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
    <FieldShell label={label} inputId={inputId} required={required} error={error} helperText={helperText}>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-black pointer-events-none">
            <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? `${inputId}-msg` : undefined}
          className={`${fieldBase} ${fieldState(error)} ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'} ${className}`}
          {...props}
        />
      </div>
    </FieldShell>
  );
};

export const Select = ({ label, error, helperText, id, required, children, className = '', ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <FieldShell label={label} inputId={selectId} required={required} error={error} helperText={helperText}>
      <div className="relative flex items-center">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={`${fieldBase} ${fieldState(error)} appearance-none pl-3.5 pr-10 cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 w-4 h-4 text-black pointer-events-none" strokeWidth={2.5} aria-hidden="true" />
      </div>
    </FieldShell>
  );
};
