import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Alert } from '../common/Alert';

// Topic + count form shared by the quiz and flashcard generators.
export const PracticeForm = ({
  title,
  description,
  topic,
  onTopicChange,
  topicPlaceholder,
  count,
  onCountChange,
  countLabel,
  error,
  submitLabel,
  submitIcon,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="bg-white border-2 border-black rounded-xl shadow-brut-lg max-w-2xl overflow-hidden">
    <div className="px-5 py-4 sm:px-7 bg-sage border-b-2 border-black">
      <h2 className="text-2xl sm:text-3xl text-black">{title}</h2>
      <p className="text-[15px] text-black leading-relaxed mt-1">{description}</p>
    </div>

    <div className="p-5 sm:p-7 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_9rem] gap-4">
        <Input
          label="Topic or subject"
          placeholder={topicPlaceholder}
          value={topic}
          onChange={onTopicChange}
          required
        />
        <Input
          label={countLabel}
          type="number"
          min="1"
          max="10"
          value={count}
          onChange={onCountChange}
          helperText="1 – 10"
          required
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" prominent icon={submitIcon}>
          {submitLabel}
        </Button>
      </div>
    </div>
  </form>
);

export const PracticeLoading = ({ title, description }) => (
  <div
    role="status"
    className="max-w-2xl flex flex-col items-center justify-center px-6 py-14 bg-yellow dot-grid border-2 border-black rounded-xl shadow-brut-lg text-center space-y-3"
  >
    <span className="w-14 h-14 inline-flex items-center justify-center rounded-lg bg-black text-yellow">
      <Loader2 className="w-7 h-7 animate-spin" strokeWidth={2.5} aria-hidden="true" />
    </span>
    <p className="font-display text-2xl font-extrabold text-black">{title}</p>
    <p className="text-[15px] text-black max-w-sm break-words">{description}</p>
  </div>
);
