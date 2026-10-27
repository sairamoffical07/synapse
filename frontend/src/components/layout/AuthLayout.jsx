import React from 'react';
import { FileText, MessageSquareText, BrainCircuit } from 'lucide-react';
import { Logo } from '../common/Logo';

// Confirmed Synapse capabilities only (upload + library, grounded chat, quiz/flashcard practice).
const features = [
  { icon: FileText, title: 'Organize', text: 'Keep lecture notes, papers and syllabi in one library.' },
  { icon: MessageSquareText, title: 'Ask', text: 'Get answers drawn from your own documents, with sources.' },
  { icon: BrainCircuit, title: 'Practice', text: 'Turn any topic into a quiz or flashcard deck.' },
];

export const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-white text-charcoal grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
    {/* Brand hero (desktop) */}
    <aside className="hidden lg:flex flex-col justify-between gap-12 p-12 xl:p-16 bg-yellow dot-grid border-r-2 border-black">
      <Logo />

      <div className="space-y-8 max-w-xl">
        <h2 className="text-6xl xl:text-7xl leading-[0.95] text-black">
          Knowledge,
          <br />
          <span className="inline-block mt-2 px-3 bg-black text-yellow -rotate-1">connected.</span>
        </h2>
        <p className="text-lg text-black max-w-md leading-relaxed">
          Synapse is an AI-powered academic workspace. Upload your study materials, ask questions about them,
          and revise with quizzes and flashcards built from what you’ve read.
        </p>
        <ul className="grid grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group bg-white border-2 border-black rounded-xl p-4 shadow-brut">
              <span className="w-10 h-10 mb-3 inline-flex items-center justify-center rounded-lg bg-sage border-2 border-black group-hover:bg-yellow transition-colors">
                <Icon className="w-5 h-5 text-black" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <p className="font-display text-xl font-extrabold text-black">{title}</p>
              <p className="text-sm text-gray-700 leading-snug mt-1">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm font-bold text-black">For students organizing academic knowledge.</p>
    </aside>

    <main className="flex flex-col">
      <div className="lg:hidden px-4 sm:px-8 py-4 bg-yellow dot-grid border-b-2 border-black">
        <Logo />
        <p className="mt-3 font-display text-3xl font-extrabold leading-tight text-black">Knowledge, connected.</p>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </main>
  </div>
);
