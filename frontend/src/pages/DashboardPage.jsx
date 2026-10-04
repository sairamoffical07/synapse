import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Bot,
  BrainCircuit,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MaterialRow } from '../components/materials/MaterialRow';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { materialsApi } from '../api/materials';
import { useAuth } from '../context/AuthContext';

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
  const recentMaterials = materials.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#111726] to-[#182032] border border-[#26334a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Knowledge Workspace</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Welcome, {user?.name || 'Student'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Upload notes, lecture materials, and syllabus PDFs to query your knowledge graph with grounded AI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" icon={UploadCloud} onClick={() => navigate('/materials')}>
            Upload Material
          </Button>
          <Button variant="secondary" icon={Bot} onClick={() => navigate('/chat')}>
            Ask Synapse
          </Button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/materials')}
          className="p-5 rounded-xl bg-[#111726] border border-[#26334a] hover:border-blue-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[#182032] border border-[#26334a] flex items-center justify-center text-blue-400 group-hover:bg-blue-600/10 group-hover:border-blue-500/30 transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              Study Materials Library
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {materials.length} {materials.length === 1 ? 'material' : 'materials'} indexed in workspace
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/chat')}
          className="p-5 rounded-xl bg-[#111726] border border-[#26334a] hover:border-blue-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[#182032] border border-[#26334a] flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 transition-colors">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
              AI Assistant (RAG Chat)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Grounded AI answers with precise document source citations
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/practice')}
          className="p-5 rounded-xl bg-[#111726] border border-[#26334a] hover:border-blue-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[#182032] border border-[#26334a] flex items-center justify-center text-cyan-400 group-hover:bg-cyan-600/10 group-hover:border-cyan-500/30 transition-colors">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
              Active Revision & Practice
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Generate multiple-choice quizzes and digital flashcards
            </p>
          </div>
        </div>
      </div>

      {/* Recent Materials Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Recent Study Materials
          </h3>
          {materials.length > 0 && (
            <button
              onClick={() => navigate('/materials')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All ({materials.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <TableRowSkeleton rows={3} />
        ) : recentMaterials.length > 0 ? (
          <div className="space-y-2.5">
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
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No study materials uploaded yet"
            description="Upload your lecture notes or textbook PDFs to build your personalized AI knowledge base."
            actionLabel="Upload First Material"
            onAction={() => navigate('/materials')}
          />
        )}
      </div>
    </div>
  );
};
