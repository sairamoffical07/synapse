import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const getState = (isAnswered, isSelected, isThisCorrect, isCorrect) => {
  if (!isAnswered) return 'idle';
  if (isSelected && isCorrect) return 'correct';
  if (isSelected && !isCorrect) return 'incorrect';
  if (isThisCorrect && !isCorrect) return 'reveal';
  return 'muted';
};

// Correct/incorrect never rely on fill alone: each state also has an icon and a text tag.
const styles = {
  idle: 'bg-white border-black text-black shadow-brut press hover:bg-yellow',
  correct: 'bg-sage border-black text-black shadow-brut',
  incorrect: 'bg-charcoal border-black text-white shadow-brut',
  reveal: 'bg-white border-black border-dashed text-black',
  muted: 'bg-white border-gray-400 text-gray-700',
};

const keyStyles = {
  idle: 'bg-sage text-black border-black',
  correct: 'bg-black text-sage border-black',
  incorrect: 'bg-yellow text-black border-yellow',
  reveal: 'bg-sage text-black border-black',
  muted: 'bg-white text-gray-700 border-gray-400',
};

// A single multiple-choice answer, shared by the Practice quiz and quizzes embedded in chat.
export const QuizOption = ({
  index,
  text,
  isAnswered,
  isSelected,
  isThisCorrect,
  isCorrect,
  onSelect,
  compact = false,
}) => {
  const state = getState(isAnswered, isSelected, isThisCorrect, isCorrect);

  return (
    <button
      type="button"
      disabled={isAnswered}
      onClick={onSelect}
      className={`w-full text-left rounded-lg border-2 font-medium flex items-center justify-between gap-3 disabled:cursor-default ${
        compact ? 'px-3 py-2.5 text-[15px]' : 'px-4 py-3.5 text-base'
      } ${styles[state]}`}
    >
      <span className="flex items-start gap-3 min-w-0">
        <span className={`w-7 h-7 rounded-md border-2 flex items-center justify-center text-sm font-bold shrink-0 ${keyStyles[state]}`}>
          {String.fromCharCode(65 + index)}
        </span>
        <span className="break-words pt-0.5 leading-snug">{text}</span>
      </span>
      {state === 'correct' && (
        <span className="inline-flex items-center gap-1 text-[13px] font-bold whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" /> Correct
        </span>
      )}
      {state === 'incorrect' && (
        <span className="inline-flex items-center gap-1 text-[13px] font-bold whitespace-nowrap shrink-0">
          <XCircle className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" /> Your answer
        </span>
      )}
      {state === 'reveal' && (
        <span className="px-2 py-0.5 rounded-md border-2 border-black bg-sage text-[13px] font-bold whitespace-nowrap shrink-0">
          Correct answer
        </span>
      )}
    </button>
  );
};
