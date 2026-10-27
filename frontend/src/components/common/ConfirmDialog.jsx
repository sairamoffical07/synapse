import React, { useEffect, useId, useRef } from 'react';
import { Button } from './Button';

// Modal confirmation built on the native <dialog> element (focus trap + Escape handled by the browser).
export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
      aria-labelledby={titleId}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border-2 border-black bg-white p-0 text-black shadow-brut-lg backdrop:bg-charcoal/70"
    >
      <div className="px-5 py-3 sm:px-6 bg-yellow border-b-2 border-black">
        <h2 id={titleId} className="text-2xl">{title}</h2>
      </div>
      {description && (
        <div className="px-5 py-5 sm:px-6 text-[15px] text-black leading-relaxed break-words">{description}</div>
      )}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-5 sm:px-6 pb-6">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant={variant === 'danger' ? 'destructive' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
};
