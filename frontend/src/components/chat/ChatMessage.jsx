import React, { useState } from 'react';
import { Loader2, RotateCw } from 'lucide-react';
import { SourceCitation } from './SourceCitation';
import { LogoMark } from '../common/Logo';
import { QuizOption } from '../practice/QuizOption';
import { parseQuizResponse, parseFlashcardResponse } from '../../utils/quizParser';

const formatTime = (timestamp) =>
  timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

export const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isThinking = message.isThinking;

  // Check if message text is a JSON quiz or flashcard response
  const quizQuestions = !isUser && !isThinking ? parseQuizResponse(message.text) : [];
  const flashcards = !isUser && !isThinking && quizQuestions.length === 0 ? parseFlashcardResponse(message.text) : [];

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] sm:max-w-xl">
          <div className="rounded-lg bg-yellow border-2 border-black shadow-brut text-black px-4 py-2.5 text-base leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </div>
          <p className="mt-2 text-right text-xs font-bold text-gray-700">You · {formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <article className="flex items-start gap-3 animate-fade-in" aria-label="Synapse response">
      <LogoMark className="w-8 h-8 mt-0.5" />

      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="font-display text-lg font-extrabold text-black">Synapse</span>
          {!isThinking && <span className="text-xs font-bold text-gray-700">{formatTime(message.timestamp)}</span>}
        </div>

        {isThinking ? (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black bg-sage text-black text-[15px] font-bold" role="status">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} aria-hidden="true" />
            <span>Searching your materials and composing an answer…</span>
          </div>
        ) : quizQuestions.length > 0 ? (
          <EmbeddedQuizList questions={quizQuestions} />
        ) : flashcards.length > 0 ? (
          <EmbeddedFlashcardList flashcards={flashcards} />
        ) : (
          <div className="bg-white border-2 border-black rounded-lg px-4 py-3.5 text-base text-black leading-[1.7] whitespace-pre-wrap break-words">
            {message.text}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <SourceCitation sources={message.sources} />
        )}
      </div>
    </article>
  );
};

// Sub-component for rendering quiz questions inside a chat response
const EmbeddedQuizList = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelectOption = (qIdx, optIdx) => {
    if (selectedAnswers[qIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  return (
    <div className="space-y-4 my-1">
      <p className="text-[15px] text-black">Here are {questions.length} questions to check your understanding:</p>

      {questions.map((q, qIdx) => {
        const selectedOpt = selectedAnswers[qIdx];
        const isAnswered = selectedOpt !== undefined;
        const isCorrect = selectedOpt === q.correctIndex;

        return (
          <div key={qIdx} className="p-4 rounded-xl bg-white border-2 border-black shadow-brut space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-700">Question {qIdx + 1} of {questions.length}</p>
            <p className="font-display text-xl font-bold leading-snug text-black">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <QuizOption
                  key={optIdx}
                  index={optIdx}
                  text={opt}
                  compact
                  isAnswered={isAnswered}
                  isSelected={selectedOpt === optIdx}
                  isThisCorrect={optIdx === q.correctIndex}
                  isCorrect={isCorrect}
                  onSelect={() => handleSelectOption(qIdx, optIdx)}
                />
              ))}
            </div>

            {isAnswered && q.explanation && (
              <p className="text-[15px] text-black leading-relaxed pt-3 border-t-2 border-black">
                <span className="font-bold">Explanation: </span>
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Sub-component for rendering flashcards inside a chat response
const EmbeddedFlashcardList = ({ flashcards }) => {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (idx) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-3 my-1">
      <p className="text-[15px] text-black">Here are {flashcards.length} flashcards. Select a card to reveal its answer.</p>

      {flashcards.map((card, idx) => {
        const isFlipped = !!flippedCards[idx];

        return (
          <button
            key={idx}
            type="button"
            onClick={() => toggleFlip(idx)}
            aria-pressed={isFlipped}
            className={`w-full text-left p-4 rounded-xl border-2 border-black space-y-2 shadow-brut press ${
              isFlipped ? 'bg-sage' : 'bg-white hover:bg-yellow'
            }`}
          >
            <span className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
              <span>Card {idx + 1} · {isFlipped ? 'Answer' : 'Prompt'}</span>
              <span className="inline-flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                Flip
              </span>
            </span>
            <span className="block font-display text-xl font-bold leading-snug text-black">
              {isFlipped ? card.back : card.front}
            </span>
          </button>
        );
      })}
    </div>
  );
};
