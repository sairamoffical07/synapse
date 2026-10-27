import React, { useState } from 'react';
import { ListChecks, Layers } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { QuizView } from '../components/practice/QuizView';
import { FlashcardView } from '../components/practice/FlashcardView';

const tabs = [
  { id: 'quiz', label: 'Quiz', icon: ListChecks },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
];

export const PracticePage = () => {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'flashcards'

  const handleKeyDown = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const idx = tabs.findIndex((t) => t.id === activeTab);
    const next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setActiveTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Practice"
        title="Revise what you’ve read"
        description="Generate a multiple-choice quiz or a deck of flashcards from your uploaded materials, then test your recall."
        actions={
          <div
            role="tablist"
            aria-label="Practice mode"
            onKeyDown={handleKeyDown}
            className="inline-flex p-1 gap-1 bg-white border-2 border-black rounded-xl shadow-brut"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  id={`tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="practice-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(id)}
                  className={`h-10 px-4 rounded-lg border-2 text-[15px] font-bold inline-flex items-center gap-2 transition-colors ${
                    selected ? 'bg-black border-black text-yellow' : 'border-transparent text-black hover:bg-sage hover:border-black'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        }
      />

      <div id="practice-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'quiz' ? <QuizView /> : <FlashcardView />}
      </div>
    </div>
  );
};
