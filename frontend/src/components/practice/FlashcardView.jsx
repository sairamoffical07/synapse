import React, { useState } from 'react';
import { Layers, RotateCw, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { aiApi } from '../../api/ai';

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
        const list = res.data.flashcards || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setFlashcards(list);
        } else {
          setError('No flashcards generated. Please verify study materials are uploaded.');
        }
      } else {
        setError(res.message || 'Failed to generate flashcards.');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to AI service.');
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
      <div className="flex flex-col items-center justify-center p-12 bg-[#111726] border border-[#26334a] rounded-xl text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-200">Building active revision flashcards...</p>
        <p className="text-xs text-slate-400">Extracting key concepts & answers from study materials</p>
      </div>
    );
  }

  if (flashcards && flashcards.length > 0) {
    const card = flashcards[currentIdx];
    const frontText = card.question || card.front || card.concept;
    const backText = card.answer || card.back || card.explanation;

    return (
      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Card {currentIdx + 1} of {flashcards.length}
          </span>
          <span className="text-xs text-slate-400">{topic}</span>
        </div>

        {/* Flip Card Workspace */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative min-h-[220px] bg-[#182032] border border-[#26334a] hover:border-blue-500/40 rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center text-center transition-all select-none shadow-sm"
        >
          <span className="absolute top-3 left-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {isFlipped ? 'Back — Explanation' : 'Front — Concept / Question'}
          </span>

          <p className="text-sm md:text-base font-medium text-slate-100 max-w-lg leading-relaxed">
            {isFlipped ? backText : frontText}
          </p>

          <span className="absolute bottom-3 right-3 text-[10px] text-blue-400 flex items-center gap-1">
            <RotateCw className="w-3 h-3" />
            Click to flip
          </span>
        </div>

        {/* Controls */}
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

  return (
    <form onSubmit={handleGenerate} className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-200">AI Flashcard Generator</h3>
        <p className="text-xs text-slate-400">Generate digital study flashcards for quick revision.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            label="Topic / Subject"
            placeholder="e.g. Data Structures, Linked Lists..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Flashcards"
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
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 p-2.5 rounded-lg">{error}</p>
      )}

      <Button type="submit" variant="primary" icon={Layers} isLoading={loading}>
        Generate Flashcards
      </Button>
    </form>
  );
};
