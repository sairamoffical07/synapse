import React from 'react';
import { HelpCircle, FileText, GitCompare, HelpCircle as QuestionIcon } from 'lucide-react';

export const SuggestedPrompts = ({ onSelectPrompt }) => {
  const prompts = [
    { label: 'Explain this concept simply', icon: HelpCircle },
    { label: 'Summarize key material points', icon: FileText },
    { label: 'Compare main concepts', icon: GitCompare },
    { label: 'Generate revision questions', icon: QuestionIcon },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {prompts.map((p, idx) => {
        const Icon = p.icon;
        return (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p.label)}
            className="px-3 py-1.5 rounded-lg bg-[#111726] border border-[#26334a] hover:border-blue-500/40 text-slate-300 hover:text-blue-400 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Icon className="w-3.5 h-3.5 text-blue-400" />
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
};
