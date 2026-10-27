import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  MessageSquareText,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { MaterialRow } from '../components/materials/MaterialRow';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { materialsApi } from '../api/materials';
import { useAuth } from '../context/AuthContext';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// The confirmed Synapse study loop: upload -> ask -> practice.
const workflow = [
  {
    step: '1',
    title: 'Build your library',
    description: 'Upload lecture notes, textbook chapters and syllabus PDFs. Each one is analyzed and indexed.',
    to: '/materials',
    cta: 'Open library',
    marker: 'border-sage text-sage',
  },
  {
    step: '2',
    title: 'Ask your materials',
    description: 'Ask questions in plain language and get answers grounded in your documents, with sources.',
    to: '/chat',
    cta: 'Ask Synapse',
    marker: 'border-yellow text-yellow',
  },
  {
    step: '3',
    title: 'Practice and recall',
    description: 'Generate a quiz or a flashcard deck on any topic you have studied, then test yourself.',
    to: '/practice',
    cta: 'Start practicing',
    marker: 'border-white text-white',
  },
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await materialsApi.getMaterials();
      if (res.success && Array.isArray(res.data)) {
        setMaterials(res.data);
      }
    } catch (e) {
      console.error('Failed to load study materials:', e);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = materials.filter((m) => m.processingStatus === 'COMPLETED').length;
  const failedCount = materials.filter((m) => m.processingStatus === 'FAILED').length;
  const recentMaterials = materials.slice(0, 3);

  // Library facts derived from the user's real materials.
  const stats = [
    { label: 'Materials in library', value: materials.length, surface: 'bg-yellow' },
    { label: 'Ready to query', value: completedCount, surface: 'bg-sage' },
    { label: 'Failed to process', value: failedCount, surface: 'bg-white' },
  ];

  return (
    <div className="space-y-12 lg:space-y-16">
      <PageHeader
        eyebrow={greeting()}
        title={`Welcome back, ${user?.name || 'Student'}`}
        description="Your study materials, connected. Add documents, ask questions about them, and test what you know."
        actions={
          <>
            <Button variant="secondary" icon={MessageSquareText} onClick={() => navigate('/chat')}>
              Ask Synapse
            </Button>
            <Button variant="primary" prominent icon={UploadCloud} onClick={() => navigate('/materials')}>
              Upload material
            </Button>
          </>
        }
      />

      <section aria-label="Library summary">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {stats.map((s) => (
            <div key={s.label} className={`${s.surface} border-2 border-black rounded-xl shadow-brut px-5 py-4 flex sm:flex-col items-center sm:items-start justify-between gap-2`}>
              <dt className="text-[15px] font-bold text-black">{s.label}</dt>
              <dd className="font-display text-5xl font-extrabold text-black tabular-nums leading-none">
                {loading ? '–' : s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* How it works: three-step horizontal flow on charcoal */}
      <section aria-labelledby="workflow-heading" className="on-dark bg-charcoal text-white border-2 border-black rounded-xl shadow-brut-lg px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <h2 id="workflow-heading" className="text-3xl sm:text-4xl text-white mb-8 lg:mb-10">How Synapse works</h2>

        <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Connector line: vertical on mobile, horizontal from md up */}
          <span aria-hidden="true" className="absolute left-7 top-14 bottom-14 w-0.5 bg-gray-700 md:hidden" />
          <span aria-hidden="true" className="hidden md:block absolute top-7 left-[calc(16.66%+1.75rem)] right-[calc(16.66%+1.75rem)] h-0.5 bg-gray-700" />

          {workflow.map(({ step, title, description, to, cta, marker }) => (
            <li key={to} className="relative flex md:flex-col md:items-center md:text-center gap-5 md:gap-4">
              <span className={`relative z-10 w-14 h-14 shrink-0 inline-flex items-center justify-center rounded-lg border-[3px] bg-charcoal font-display text-3xl font-extrabold ${marker}`}>
                {step}
              </span>
              <div className="space-y-2 md:max-w-xs">
                <h3 className="text-2xl text-white">{title}</h3>
                <p className="text-[15px] text-sage leading-relaxed">{description}</p>
                <Link
                  to={to}
                  className="inline-flex items-center gap-1.5 pt-1 text-[15px] font-bold text-yellow underline underline-offset-4 decoration-2 hover:decoration-white hover:text-white rounded"
                >
                  {cta}
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="recent-heading" className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <h2 id="recent-heading" className="text-3xl text-black">Recently added</h2>
          {materials.length > 0 && (
            <Link
              to="/materials"
              className="inline-flex items-center gap-1 text-[15px] font-bold text-black underline underline-offset-4 decoration-2 hover:bg-yellow rounded px-1"
            >
              View library ({materials.length})
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
          )}
        </div>

        {loading ? (
          <TableRowSkeleton rows={3} />
        ) : recentMaterials.length > 0 ? (
          <ul className="bg-white border-2 border-black rounded-xl shadow-brut divide-y-2 divide-black">
            {recentMaterials.map((mat) => (
              <MaterialRow
                key={mat.id}
                material={mat}
                onAskAi={() => navigate('/chat')}
                onDelete={async (id) => {
                  try {
                    await materialsApi.deleteMaterial(id);
                    fetchMaterials();
                  } catch (e) {
                    console.error('Delete failed:', e);
                  }
                }}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={FileText}
            title="Your library is empty"
            description="Upload your lecture notes or textbook PDFs to build a personal knowledge base you can question."
            actionLabel="Upload your first material"
            onAction={() => navigate('/materials')}
          />
        )}
      </section>
    </div>
  );
};
