import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center bg-white border-2 border-dashed border-black rounded-xl ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-lg bg-sage border-2 border-black flex items-center justify-center text-black mb-5 shadow-brut">
          <Icon className="w-6 h-6" strokeWidth={2.25} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-2xl text-black mb-1.5">{title}</h3>
      <p className="text-[15px] text-gray-700 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
