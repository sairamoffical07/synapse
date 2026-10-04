import React, { useState } from 'react';
import { Bot, User, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { SourceCitation } from './SourceCitation';
import { parseQuizResponse, parseFlashcardResponse } from '../../utils/quizParser';

export const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isThinking = message.isThinking;

  // Check if message text is a JSON quiz or flashcard response
  const quizQuestions = !isUser && !isThinking ? parseQuizResponse(message.text) : [];
  const flashcards = !isUser && !isThinking && quizQuestions.length === 0 ? parseFlashcardResponse(message.text) : [];

  return (
    <div className={`flex items-start gap-3 text-xs leading-relaxed ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
            : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      <div
        className={`max-w-2xl rounded-xl p-4 border ${
          isUser
            ? 'bg-blue-600/15 border-blue-500/20 text-slate-100 rounded-tr-none'
            : 'bg-[#111726] border-[#26334a] text-slate-200 rounded-tl-none'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-400 mb-1.5 tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            <span>SYNAPSE AI</span>
          </div>
        )}

        {isThinking ? (
          <div className="flex items-center gap-2 text-slate-400 py-1">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Analyzing your study materials & generating grounded answer...</span>
          </div>
        ) : quizQuestions.length > 0 ? (
          <EmbeddedQuizList questions={quizQuestions} />
        ) : flashcards.length > 0 ? (
          <EmbeddedFlashcardList flashcards={flashcards} />
        ) : (
          <div className="whitespace-pre-wrap space-y-2 text-slate-200">
            {message.text}
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitation sources={message.sources} />
        )}

        <div className="mt-2 text-[10px] text-slate-400 text-right">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
};

// Sub-component for rendering quiz questions inside chat message bubble
const EmbeddedQuizList = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelectOption = (qIdx, optIdx) => {
    if (selectedAnswers[qIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  return (
    <div className="space-y-4 my-1">
      <div className="text-xs font-medium text-slate-300">
        Generated Quiz Questions ({questions.length} questions):
      </div>

      {questions.map((q, qIdx) => {
        const selectedOpt = selectedAnswers[qIdx];
        const isAnswered = selectedOpt !== undefined;
        const isCorrect = selectedOpt === q.correctIndex;

        return (
          <div key={qIdx} className="p-3.5 rounded-xl bg-[#182032] border border-[#26334a] space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-blue-400">
              <span>Question {qIdx + 1} of {questions.length}</span>
            </div>

            <p className="font-semibold text-slate-100 text-xs">{q.question}</p>

            <div className="space-y-1.5">
              {q.options.map((opt, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const isThisCorrect = optIdx === q.correctIndex;

                let style = 'bg-[#111726] border-[#26334a] text-slate-300 hover:border-[#3b4d6b]';
                let icon = null;

                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    style = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-medium';
                    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-red-950/40 border-red-500 text-red-200 font-medium';
                    icon = <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
                  } else if (isThisCorrect && !isCorrect) {
                    style = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300';
                    icon = <span className="text-[9px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">Correct Answer</span>;
                  } else {
                    style = 'bg-[#111726]/50 border-[#26334a]/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(qIdx, optIdx)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${style}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#0b0f17] border border-[#26334a] flex items-center justify-center text-[10px] font-semibold text-slate-400 shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>

            {isAnswered && q.explanation && (
              <p className="text-[11px] text-slate-400 italic pt-1 border-t border-[#26334a]">
                Explanation: {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Sub-component for rendering flashcards inside chat message bubble
const EmbeddedFlashcardList = ({ flashcards }) => {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (idx) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-3 my-1">
      <div className="text-xs font-medium text-slate-300">
        Generated Revision Flashcards ({flashcards.length} cards):
      </div>

      {flashcards.map((card, idx) => {
        const isFlipped = !!flippedCards[idx];

        return (
          <div
            key={idx}
            onClick={() => toggleFlip(idx)}
            className="p-4 rounded-xl bg-[#182032] border border-[#26334a] hover:border-blue-500/40 cursor-pointer space-y-2 transition-all"
          >
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Card {idx + 1} — {isFlipped ? 'Back (Explanation)' : 'Front (Concept)'}</span>
              <span className="text-blue-400">Click to flip</span>
            </div>

            <p className="text-xs font-semibold text-slate-100">
              {isFlipped ? card.back : card.front}
            </p>
          </div>
        );
      })}
    </div>
  );
};
