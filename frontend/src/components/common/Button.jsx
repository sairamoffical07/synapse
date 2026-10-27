import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  prominent = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans font-bold rounded-lg border-2 select-none whitespace-nowrap';

  // Raised variants carry a hard shadow and the press interaction; flat ones change fill on hover.
  const raised = prominent ? 'shadow-brut-lg press-lg' : 'shadow-brut press';

  const variants = {
    primary: `bg-yellow border-black text-black ${raised}`,
    secondary: `bg-white border-black text-black hover:bg-sage ${raised}`,
    dark: `bg-charcoal border-black text-white hover:bg-black ${raised}`,
    outline: 'bg-white border-black text-black hover:bg-sage transition-colors',
    ghost: 'bg-transparent border-transparent text-black hover:border-black hover:bg-white transition-colors',
    danger: 'bg-white border-black text-black hover:bg-charcoal hover:text-white transition-colors',
    destructive: `bg-charcoal border-black text-white hover:bg-black ${raised}`,
  };

  const sizes = {
    sm: 'text-sm h-9 px-3 gap-1.5',
    md: 'text-[15px] h-11 px-4 gap-2',
    lg: 'text-base h-12 px-6 gap-2',
  };

  const isDisabled = disabled || isLoading;
  const stateStyles = isLoading
    ? 'cursor-progress'
    : disabled
      ? '!bg-gray-100 !text-gray-400 !border-gray-400 !shadow-none cursor-not-allowed'
      : 'cursor-pointer';

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${stateStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      ) : null}
      {children != null && children !== false && <span className="inline-flex items-center">{children}</span>}
    </button>
  );
};
