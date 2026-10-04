import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export const SourceCitation = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border border-[#26334a] rounded-lg bg-[#0b0f17]/60 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-slate-300 hover:text-slate-100 hover:bg-[#182032] transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-slate-300">
            {sources.length} Grounded Document {sources.length === 1 ? 'Citation' : 'Citations'}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-[#1f293d] space-y-2 bg-[#0b0f17]">
          {sources.map((source, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-md bg-[#111726] border border-[#26334a] flex flex-col gap-1 text-[11px]"
            >
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                  {source.fileName || `Study Material #${source.studyMaterialId}`}
                </span>
                <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#182032] border border-[#26334a]">
                  Chunk #{source.chunkIndex ?? idx + 1}
                </span>
              </div>
              {source.excerpt && (
                <p className="text-slate-400 italic line-clamp-2 mt-0.5 font-mono text-[10px] leading-relaxed">
                  "{source.excerpt}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
