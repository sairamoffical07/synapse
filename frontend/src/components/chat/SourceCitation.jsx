import React, { useId, useState } from 'react';
import { BookOpen, ChevronDown, FileText } from 'lucide-react';

export const SourceCitation = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border-2 border-black bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full h-11 px-3.5 flex items-center justify-between gap-2 bg-sage text-black font-bold text-[15px] hover:bg-yellow transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          {sources.length} {sources.length === 1 ? 'source' : 'sources'} from your library
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {isOpen && (
        <ol id={panelId} className="divide-y-2 divide-black border-t-2 border-black">
          {sources.map((source, idx) => (
            <li key={idx} className="px-3.5 py-3 flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-start gap-2 min-w-0 text-black font-bold text-[15px]">
                  <span className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-md bg-black text-yellow text-xs tabular-nums">
                    {idx + 1}
                  </span>
                  <FileText className="w-4 h-4 mt-1 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  <span className="break-words">{source.fileName || `Study Material #${source.studyMaterialId}`}</span>
                </span>
                <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap shrink-0 pt-0.5">
                  Passage {source.chunkIndex ?? idx + 1}
                </span>
              </div>
              {source.excerpt && (
                <p className="text-[15px] text-black leading-relaxed line-clamp-3 border-l-4 border-yellow pl-3">
                  {source.excerpt}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
