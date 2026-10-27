import React, { useState } from 'react';
import { RotateCcw, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { PracticeForm, PracticeLoading } from './PracticeForm';
import { QuizOption } from './QuizOption';
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
      <PracticeLoading
        title="Writing your quiz…"
        description={`Reading your materials on “${topic}” and drafting questions grounded in them.`}
      />
    );
  }

  // Completion screen
  if (isCompleted && questions) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl bg-white border-2 border-black rounded-xl shadow-brut-lg overflow-hidden animate-fade-in">
        <div className="px-6 py-5 sm:px-8 bg-yellow dot-grid border-b-2 border-black text-center">
          <p className="text-[13px] font-bold uppercase tracking-wider text-black">Quiz complete</p>
          <h2 className="text-3xl text-black break-words mt-1">{topic}</h2>
        </div>

        <div className="p-6 sm:p-8 text-center space-y-7">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sage border-2 border-black rounded-xl py-5 px-3">
              <p className="font-display text-5xl font-extrabold text-black tabular-nums leading-none">
                {score}<span className="text-3xl"> / {questions.length}</span>
              </p>
              <p className="mt-2 text-sm font-bold text-black">Correct answers</p>
            </div>
            <div className="bg-charcoal border-2 border-black rounded-xl py-5 px-3">
              <p className="font-display text-5xl font-extrabold text-yellow tabular-nums leading-none">{percentage}%</p>
              <p className="mt-2 text-sm font-bold text-white">Accuracy</p>
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
              Try again
            </Button>
            <Button
              variant="primary"
              icon={Sparkles}
              onClick={() => {
                setQuestions(null);
                setTopic('');
              }}
            >
              New quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Interactive quiz stepper
  if (questions && questions.length > 0) {
    const currentQ = questions[currentIdx];
    const selectedOpt = selectedAnswers[currentIdx];
    const isAnswered = selectedOpt !== undefined;
    const isCorrect = selectedOpt === currentQ.correctIndex;
    const progress = ((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100;

    return (
      <div className="max-w-3xl bg-white border-2 border-black rounded-xl shadow-brut-lg overflow-hidden animate-fade-in">
        {/* Progress */}
        <div className="px-5 sm:px-7 py-4 space-y-3 bg-sage border-b-2 border-black">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-bold text-black tabular-nums whitespace-nowrap">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="font-bold text-black truncate min-w-0" title={topic}>{topic}</span>
          </div>
          <div
            className="h-4 rounded-md bg-white border-2 border-black overflow-hidden"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={currentIdx + (isAnswered ? 1 : 0)}
          >
            <div className="h-full bg-yellow border-r-2 border-black transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <fieldset className="px-5 sm:px-7 py-7 space-y-6">
          <legend className="sr-only">Question {currentIdx + 1}</legend>
          <h2 className="text-2xl sm:text-3xl leading-tight text-black break-words" key={currentIdx}>
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((optionText, optIdx) => (
              <QuizOption
                key={optIdx}
                index={optIdx}
                text={optionText}
                isAnswered={isAnswered}
                isSelected={selectedOpt === optIdx}
                isThisCorrect={optIdx === currentQ.correctIndex}
                isCorrect={isCorrect}
                onSelect={() => handleSelectOption(optIdx)}
              />
            ))}
          </div>

          {isAnswered && currentQ.explanation && (
            <div className="p-4 rounded-lg bg-white border-2 border-black border-l-8 text-[15px] space-y-1 animate-fade-in" aria-live="polite">
              <p className="font-bold text-black">{isCorrect ? 'Correct.' : 'Not quite.'} Here’s why</p>
              <p className="text-black leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}
        </fieldset>

        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t-2 border-black bg-white">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => prev - 1)}
          >
            Previous
          </Button>

          <Button variant="primary" disabled={!isAnswered} onClick={handleNext}>
            {currentIdx === questions.length - 1 ? 'See results' : 'Next question'}
            <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2.5} aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PracticeForm
      title="Quiz generator"
      description="Create multiple-choice questions drawn from your uploaded study materials."
      topic={topic}
      onTopicChange={(e) => setTopic(e.target.value)}
      topicPlaceholder="e.g. Embedded system design, polymorphism…"
      count={count}
      onCountChange={(e) => setCount(e.target.value)}
      countLabel="Questions"
      error={error}
      submitLabel="Generate quiz"
      submitIcon={Sparkles}
      onSubmit={handleGenerate}
    />
  );
};
