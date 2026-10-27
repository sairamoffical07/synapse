import React, { useState } from 'react';
import { Layers, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';
import { PracticeForm, PracticeLoading } from './PracticeForm';
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
      <PracticeLoading
        title="Building your flashcards…"
        description={`Pulling key concepts and explanations about “${topic}” from your materials.`}
      />
    );
  }

  if (flashcards && flashcards.length > 0) {
    const card = flashcards[currentIdx];

    return (
      <div className="max-w-2xl space-y-5 animate-fade-in">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="px-2.5 py-1 rounded-md border-2 border-black bg-black text-yellow font-bold tabular-nums whitespace-nowrap">
            Card {currentIdx + 1} of {flashcards.length}
          </span>
          <span className="font-bold text-black truncate min-w-0" title={topic}>{topic}</span>
        </div>

        {/* Flip card: the whole card is a button so it works with keyboard and screen readers */}
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          aria-pressed={isFlipped}
          aria-label={`${isFlipped ? 'Answer' : 'Prompt'}: ${isFlipped ? card.back : card.front}. Select to flip.`}
          className={`relative w-full min-h-[280px] sm:min-h-[320px] rounded-xl border-2 border-black px-6 py-14 sm:px-12 flex flex-col items-center justify-center text-center shadow-brut-lg press-lg ${
            isFlipped ? 'bg-sage' : 'bg-yellow dot-grid'
          }`}
        >
          <span className="absolute top-4 left-4 px-2 py-0.5 rounded-md border-2 border-black bg-white text-xs font-bold uppercase tracking-wider text-black">
            {isFlipped ? 'Answer' : 'Prompt'}
          </span>

          <span
            key={`${currentIdx}-${isFlipped}`}
            className={`block max-w-lg font-display font-extrabold leading-tight text-black break-words animate-fade-in ${
              isFlipped ? 'text-xl sm:text-2xl font-bold' : 'text-2xl sm:text-4xl'
            }`}
          >
            {isFlipped ? card.back : card.front}
          </span>

          <span className="absolute bottom-4 right-4 text-sm font-bold text-black inline-flex items-center gap-1.5">
            <RotateCw className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            {isFlipped ? 'Show prompt' : 'Reveal answer'}
          </span>
        </button>

        {/* Deck position */}
        <div className="flex justify-center gap-1.5" aria-hidden="true">
          {flashcards.map((c, idx) => (
            <span
              key={c.id}
              className={`h-3 rounded-sm border-2 border-black transition-all ${idx === currentIdx ? 'w-8 bg-black' : 'w-3 bg-white'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="sm" disabled={currentIdx === 0} onClick={handlePrev} icon={ChevronLeft}>
            Previous
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsFlipped(!isFlipped)} icon={RotateCw}>
            Flip
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentIdx === flashcards.length - 1}
            onClick={handleNext}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" strokeWidth={2.5} aria-hidden="true" />
          </Button>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setFlashcards(null)}
            className="text-[15px] font-bold text-black underline underline-offset-4 decoration-2 hover:bg-yellow rounded px-1"
          >
            Generate a new deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <PracticeForm
      title="Flashcard generator"
      description="Turn the key concepts in your materials into cards for active recall."
      topic={topic}
      onTopicChange={(e) => setTopic(e.target.value)}
      topicPlaceholder="e.g. Data structures, real-time operating systems…"
      count={count}
      onCountChange={(e) => setCount(e.target.value)}
      countLabel="Cards"
      error={error}
      submitLabel="Generate flashcards"
      submitIcon={Layers}
      onSubmit={handleGenerate}
    />
  );
};
