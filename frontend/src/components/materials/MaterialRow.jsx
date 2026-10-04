import React from 'react';
import { FileText, Trash2, Bot, Calendar, HardDrive } from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatFileSize, formatDate } from '../../utils/formatters';

export const MaterialRow = ({ material, onDelete, onAskAi }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#111726] border border-[#26334a] rounded-xl hover:border-[#3b4d6b] transition-all gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#182032] border border-[#26334a] flex items-center justify-center text-blue-400 shrink-0">
          <FileText className="w-5 h-5 stroke-[1.5]" />
        </div>

        <div className="flex flex-col min-w-0">
          <h4 className="text-xs font-semibold text-slate-200 truncate pr-2">
            {material.originalFileName || material.fileName || 'Untitled Document'}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-400" />
              {formatFileSize(material.fileSize)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(material.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1f293d]">
        <Badge status={material.processingStatus} />

        <div className="flex items-center gap-2">
          {material.processingStatus === 'COMPLETED' && onAskAi && (
            <button
              onClick={() => onAskAi(material)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-800/40 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Query document with Synapse AI"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          )}

          <button
            onClick={() => onDelete(material.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition-colors"
            title="Delete material"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
