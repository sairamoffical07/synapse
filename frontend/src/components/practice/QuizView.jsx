import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { aiApi } from '../../api/ai';

export const QuizView = () => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setQuizData(null);
    setUserAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);

    try {
      const res = await aiApi.generateQuiz(topic, count);
      if (res.success && res.data) {
        // Normalizing questions list format
        const questions = res.data.questions || res.data;
        if (Array.isArray(questions) && questions.length > 0) {
          setQuizData(questions);
        } else {
          setError('No quiz questions generated for this topic. Please ensure materials are uploaded.');
        }
      } else {
        setError(res.message || 'Failed to generate quiz questions.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx) => {
    if (isCompleted) return;
    setUserAnswers((prev) => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIdx < quizData.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.forEach((q, idx) => {
      const correctIndex = q.correctIndex !== undefined ? q.correctIndex : q.correctOptionIndex;
      if (userAnswers[idx] === correctIndex) {
        score++;
      }
    });
    return score;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#111726] border border-[#26334a] rounded-xl text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-200">Building knowledge quiz from uploaded materials...</p>
        <p className="text-xs text-slate-400">Extracting key concepts & synthesizing questions</p>
      </div>
    );
  }

  if (isCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / quizData.length) * 100);

    return (
      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-6 text-center space-y-6 animate-fade-in">
        <div className="inline-flex p-3 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-100">Quiz Completed</h3>
          <p className="text-xs text-slate-400">Topic: <span className="text-slate-200 font-medium">{topic}</span></p>
        </div>

        <div className="py-4 border-y border-[#1f293d] flex justify-center gap-8">
          <div>
            <span className="block text-2xl font-bold text-slate-100">{score} / {quizData.length}</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Score</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-blue-400">{percentage}%</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Accuracy</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="secondary" icon={RotateCcw} onClick={() => { setIsCompleted(false); setCurrentIdx(0); setUserAnswers({}); }}>
            Retry Quiz
          </Button>
          <Button variant="primary" onClick={() => { setQuizData(null); setTopic(''); }}>
            Generate Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (quizData && quizData.length > 0) {
    const currentQ = quizData[currentIdx];
    const selectedOpt = userAnswers[currentIdx];
    const options = currentQ.options || [];

    return (
      <div className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
            Question {currentIdx + 1} of {quizData.length}
          </span>
          <span className="text-xs text-slate-400">{topic}</span>
        </div>

        <h3 className="text-sm font-semibold text-slate-100 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-2.5">
          {options.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-slate-100 shadow-xs'
                    : 'bg-[#182032] border-[#26334a] hover:border-[#3b4d6b] text-slate-300'
                }`}
              >
                <span>{opt}</span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-400 bg-blue-500 text-white' : 'border-slate-600'}`}>
                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-[#1f293d]">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((prev) => prev - 1)}
            className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30"
          >
            Previous
          </button>

          <Button
            variant="primary"
            disabled={selectedOpt === undefined}
            onClick={handleNext}
            icon={ArrowRight}
          >
            {currentIdx === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="bg-[#111726] border border-[#26334a] rounded-xl p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-200">AI Quiz Generator</h3>
        <p className="text-xs text-slate-400">Generate multiple-choice quiz questions based on your uploaded study materials.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            label="Topic / Subject"
            placeholder="e.g. Object Oriented Programming, Polymorphism..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            label="Questions"
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

      <Button type="submit" variant="primary" icon={Sparkles} isLoading={loading}>
        Generate Quiz
      </Button>
    </form>
  );
};
