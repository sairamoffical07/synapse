import React, { useState } from 'react';
import { FileText, Trash2, MessageSquareText } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatFileSize, formatDate } from '../../utils/formatters';

// One document in the library list. Render inside a <ul> with dividers.
export const MaterialRow = ({ material, onDelete, onAskAi }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const name = material.originalFileName || material.fileName || 'Untitled document';
  const isReady = material.processingStatus === 'COMPLETED';

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(material.id);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <li className="group flex flex-col gap-3 px-4 py-4 sm:px-5 md:flex-row md:items-center md:gap-5">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-lg bg-sage border-2 border-black text-black flex items-center justify-center shrink-0 group-hover:bg-yellow transition-colors">
          <FileText className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-bold tracking-normal text-black leading-snug break-words line-clamp-3 sm:line-clamp-2" title={name}>
            {name}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-gray-700">
            <span>PDF</span>
            <span aria-hidden="true">/</span>
            <span>{formatFileSize(material.fileSize)}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={material.uploadedAt}>{formatDate(material.uploadedAt)}</time>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pl-[3.75rem] md:pl-0 md:justify-end shrink-0">
        <Badge status={material.processingStatus} />

        <div className="flex items-center gap-2">
          {isReady && onAskAi && (
            <Button variant="outline" size="sm" icon={MessageSquareText} onClick={() => onAskAi(material)}>
              Ask
            </Button>
          )}

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label={`Delete ${name}`}
            title="Delete material"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border-2 border-black bg-white text-black hover:bg-charcoal hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this material?"
        description={
          <>
            <span className="font-bold">{name}</span> and its indexed passages will be removed from your
            library. Synapse will no longer use it to answer questions.
          </>
        }
        confirmLabel="Delete"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </li>
  );
};
