import React from 'react';
import { Lightbulb, FileText, GitCompare, ListChecks } from 'lucide-react';

export const SuggestedPrompts = ({ onSelectPrompt, disabled = false }) => {
  const prompts = [
    { label: 'Explain this concept simply', icon: Lightbulb },
    { label: 'Summarize key material points', icon: FileText },
    { label: 'Compare main concepts', icon: GitCompare },
    { label: 'Generate revision questions', icon: ListChecks },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pt-0.5 pb-1.5" role="group" aria-label="Suggested questions">
      {prompts.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(p.label)}
            className="h-9 px-3 rounded-lg bg-white border-2 border-black text-black text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-brut-sm hover:bg-yellow transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-400 disabled:shadow-none disabled:pointer-events-none"
          >
            <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
};
