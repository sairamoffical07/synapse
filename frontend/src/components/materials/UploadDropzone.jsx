import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export const UploadDropzone = ({ onUpload, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndProcess = (file) => {
    setError(null);
    if (!file || isUploading) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents are supported for knowledge extraction.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('That file is too large. PDFs must be 50 MB or smaller.');
      return;
    }

    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
    // Allow re-selecting the same file after an error.
    e.target.value = '';
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed border-black px-5 py-7 sm:px-7 transition-colors flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left ${
          dragActive ? 'bg-yellow dot-grid border-solid shadow-brut' : 'bg-white hover:bg-yellow hover:dot-grid'
        } ${isUploading ? 'cursor-progress' : 'cursor-pointer'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          disabled={isUploading}
        />

        <div className="w-14 h-14 rounded-lg bg-sage border-2 border-black text-black flex items-center justify-center shrink-0">
          <UploadCloud className="w-6 h-6" strokeWidth={2.25} aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0 space-y-1" aria-live="polite">
          <p className="font-display text-xl sm:text-2xl font-extrabold text-black">
            {isUploading ? 'Analyzing your notes…' : 'Drop a PDF here, or choose a file'}
          </p>
          <p className="text-[15px] text-gray-700">
            {isUploading
              ? 'Extracting text and indexing passages. Long documents can take a moment.'
              : 'Lecture notes, textbook chapters, papers and syllabi. Up to 50 MB.'}
          </p>
        </div>

        <Button
          variant="primary"
          prominent
          isLoading={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {isUploading ? 'Uploading…' : 'Choose PDF'}
        </Button>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
};
