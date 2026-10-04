import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { aiApi } from '../../api/ai';
import { parseQuizResponse } from '../../utils/quizParser';

export const QuizView = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setQuestions(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);

    try {
      const res = await aiApi.generateQuiz(topic, count);
      if (res.success && res.data) {
        const parsedQuestions = parseQuizResponse(res.data);
        if (parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
        } else {
          setError('Could not generate structured quiz questions for this topic. Please ensure study materials are uploaded.');
        }
      } else {
        setError(res.message || 'Failed to generate quiz. Make sure study materials are uploaded.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx) => {
    // Prevent multiple selections for the same question
    if (selectedAnswers[currentIdx] !== undefined || isCompleted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#111726] border border-[#26334a] rounded-xl text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-200">Analyzing study materials & generating interactive quiz...</p>
        <p className="text-xs text-slate-400">Synthesizing questions based on grounded document context</p>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted && questions) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-6 md:p-8 text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="inline-flex p-3 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100">Quiz Completed</h3>
          <p className="text-xs text-slate-400">
            Topic: <span className="text-slate-200 font-medium">{topic}</span>
          </p>
        </div>

        <div className="py-4 border-y border-[#1f293d] flex justify-center gap-10">
          <div>
            <span className="block text-3xl font-extrabold text-slate-100">{score} / {questions.length}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Correct Answers</span>
          </div>
          <div>
            <span className="block text-3xl font-extrabold text-blue-400">{percentage}%</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Accuracy</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => {
              setIsCompleted(false);
              setCurrentIdx(0);
              setSelectedAnswers({});
            }}
          >
            Try Again
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setQuestions(null);
              setTopic('');
            }}
          >
            Generate Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Interactive Quiz Stepper Card
  if (questions && questions.length > 0) {
    const currentQ = questions[currentIdx];
    const selectedOpt = selectedAnswers[currentIdx];
    const isAnswered = selectedOpt !== undefined;
    const isCorrect = selectedOpt === currentQ.correctIndex;

    return (
      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-5 md:p-7 space-y-6 animate-fade-in max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-blue-600/15 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{topic}</span>
        </div>

        {/* Question Text */}
        <div className="space-y-1">
          <h3 className="text-sm md:text-base font-semibold text-slate-100 leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Multiple Choice Options Grid */}
        <div className="space-y-3">
          {currentQ.options.map((optionText, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            const isThisCorrect = optIdx === currentQ.correctIndex;

            let optionStyle = 'bg-[#182032] border-[#26334a] text-slate-300 hover:border-[#3b4d6b] hover:text-slate-100';
            let icon = null;

            if (isAnswered) {
              if (isSelected && isCorrect) {
                optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-medium';
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-red-950/40 border-red-500 text-red-200 font-medium';
                icon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
              } else if (isThisCorrect && !isCorrect) {
                optionStyle = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300';
                icon = <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">Correct Answer</span>;
              } else {
                optionStyle = 'bg-[#182032]/50 border-[#26334a]/50 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3.5 md:p-4 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-[#0b0f17] border border-[#26334a] flex items-center justify-center text-xs font-semibold text-slate-400 shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="break-words">{optionText}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Feedback */}
        {isAnswered && currentQ.explanation && (
          <div className="p-3.5 rounded-xl bg-[#0b0f17]/60 border border-[#26334a] text-xs text-slate-300 space-y-1 animate-fade-in">
            <span className="font-semibold text-blue-400 block text-[11px] uppercase tracking-wider">Explanation</span>
            <p className="text-slate-400 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1f293d]">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => prev - 1)}
            className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
          >
            Previous
          </button>

          <Button
            variant="primary"
            disabled={!isAnswered}
            onClick={handleNext}
            icon={ArrowRight}
          >
            {currentIdx === questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Form Input State
  return (
    <form onSubmit={handleGenerate} className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-200">AI Quiz Generator</h3>
        <p className="text-xs text-slate-400">Generate interactive multiple-choice questions based on your uploaded study materials.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            label="Topic / Subject"
            placeholder="e.g. Embedded System Design, Polymorphism..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Number of Questions"
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

      <Button type="submit" variant="primary" icon={Sparkles} isLoading={loading}>
        Generate Quiz
      </Button>
    </form>
  );
};
