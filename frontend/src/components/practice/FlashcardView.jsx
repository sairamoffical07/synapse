import React, { useState } from 'react';
import { Layers, RotateCw, ChevronLeft, ChevronRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { aiApi } from '../../api/ai';
import { parseFlashcardResponse } from '../../utils/quizParser';

export const FlashcardView = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flashcards, setFlashcards] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setFlashcards(null);
    setCurrentIdx(0);
    setIsFlipped(false);

    try {
      const res = await aiApi.generateFlashcards(topic, count);
      if (res.success && res.data) {
        const parsedCards = parseFlashcardResponse(res.data);
        if (parsedCards.length > 0) {
          setFlashcards(parsedCards);
        } else {
          setError('Could not generate flashcards for this topic. Ensure study materials are uploaded.');
        }
      } else {
        setError(res.message || 'Failed to generate flashcards.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < flashcards.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#111726] border border-[#26334a] rounded-xl text-center space-y-3 max-w-2xl mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-200">Building active revision flashcards...</p>
        <p className="text-xs text-slate-400">Extracting key concepts & explanations from uploaded materials</p>
      </div>
    );
  }

  if (flashcards && flashcards.length > 0) {
    const card = flashcards[currentIdx];

    return (
      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-5 md:p-7 space-y-6 animate-fade-in max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <span className="px-2.5 py-1 rounded bg-blue-600/15 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            Flashcard {currentIdx + 1} of {flashcards.length}
          </span>
          <span className="text-xs text-slate-400 truncate max-w-xs">{topic}</span>
        </div>

        {/* Interactive Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative min-h-[240px] md:min-h-[280px] border rounded-xl p-6 md:p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all select-none shadow-sm ${
            isFlipped
              ? 'bg-[#182032] border-blue-500/40 text-slate-100'
              : 'bg-[#111726] border-[#26334a] hover:border-blue-500/40 text-slate-200'
          }`}
        >
          <span className="absolute top-4 left-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {isFlipped ? 'Back — Explanation' : 'Front — Question / Concept'}
          </span>

          <p className="text-sm md:text-base font-semibold max-w-md leading-relaxed">
            {isFlipped ? card.back : card.front}
          </p>

          <span className="absolute bottom-4 right-4 text-[11px] text-blue-400 flex items-center gap-1.5 font-medium">
            <RotateCw className="w-3.5 h-3.5" />
            Click to flip
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentIdx === 0}
            onClick={handlePrev}
            icon={ChevronLeft}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFlipped(!isFlipped)}
            icon={RotateCw}
          >
            Flip Card
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentIdx === flashcards.length - 1}
            onClick={handleNext}
          >
            Next <ChevronRight className="w-4 h-4 ml-1 inline" />
          </Button>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <form onSubmit={handleGenerate} className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-200">AI Flashcard Generator</h3>
        <p className="text-xs text-slate-400">Generate digital study flashcards for active concept recall.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            label="Topic / Subject"
            placeholder="e.g. Data Structures, Real-Time Operating Systems..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Number of Cards"
            type="number"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-xs">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" icon={Layers} isLoading={loading}>
        Generate Flashcards
      </Button>
    </form>
  );
};
