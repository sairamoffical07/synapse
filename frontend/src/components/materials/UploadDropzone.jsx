import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

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
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Only PDF documents are supported for knowledge extraction.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB maximum limit.');
      return;
    }

    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border border-dashed rounded-xl p-6 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
          dragActive
            ? 'border-blue-500 bg-blue-950/20'
            : 'border-[#26334a] hover:border-[#3b4d6b] bg-[#111726]/40 hover:bg-[#111726]/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="w-10 h-10 rounded-lg bg-[#182032] border border-[#26334a] flex items-center justify-center text-blue-400">
          <UploadCloud className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-200">
            Click to upload or drag & drop PDF materials
          </p>
          <p className="text-[11px] text-slate-500">
            PDF lecture notes, textbooks, and syllabus files (Max 50MB)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          isLoading={isUploading}
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {isUploading ? 'Analyzing & Indexing PDF...' : 'Select PDF File'}
        </Button>
      </div>

      {error && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
