import React, { useState } from 'react';
import { HelpCircle, Layers, BrainCircuit } from 'lucide-react';
import { QuizView } from '../components/practice/QuizView';
import { FlashcardView } from '../components/practice/FlashcardView';

export const PracticePage = () => {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'flashcards'

  return (
    <div className="space-y-6">
      {/* Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Active Knowledge Recall</span>
          </div>
          <h2 className="text-base font-bold text-slate-100">Revision & Practice</h2>
          <p className="text-xs text-slate-400">
            Reinforce learning through AI-generated multiple choice quizzes and revision flashcards.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-[#111726] border border-[#26334a] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              activeTab === 'quiz'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Multiple-Choice Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              activeTab === 'flashcards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Digital Flashcards</span>
          </button>
        </div>
      </div>

      {/* Active Mode View */}
      {activeTab === 'quiz' ? <QuizView /> : <FlashcardView />}
    </div>
  );
};
