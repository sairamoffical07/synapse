import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { UploadDropzone } from '../components/materials/UploadDropzone';
import { MaterialRow } from '../components/materials/MaterialRow';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { materialsApi } from '../api/materials';

export const MaterialsPage = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setError(null);
    try {
      const res = await materialsApi.getMaterials();
      if (res.success && Array.isArray(res.data)) {
        setMaterials(res.data);
      } else {
        setError(res.message || 'Failed to load study materials.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend service.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const res = await materialsApi.uploadMaterial(file);
      if (res.success) {
        await fetchMaterials();
      } else {
        setError(res.message || 'Failed to upload study material.');
      }
    } catch (err) {
      setError(err.message || 'PDF upload processing failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await materialsApi.deleteMaterial(id);
      if (res.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      } else {
        setError(res.message || 'Failed to delete study material.');
      }
    } catch (err) {
      setError(err.message || 'Deletion error.');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const name = m.originalFileName || m.fileName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-100">Study Library</h2>
          <p className="text-xs text-slate-400">
            Manage your uploaded textbooks, syllabus files, and PDF lecture notes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchMaterials}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Upload Dropzone */}
      <UploadDropzone onUpload={handleUpload} isUploading={uploading} />

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Library Table / List */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#1f293d]">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Uploaded Documents ({materials.length})
          </h3>

          {materials.length > 0 && (
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search materials..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {loading ? (
          <TableRowSkeleton rows={4} />
        ) : filteredMaterials.length > 0 ? (
          <div className="space-y-2.5">
            {filteredMaterials.map((material) => (
              <MaterialRow
                key={material.id}
                material={material}
                onAskAi={() => navigate('/chat')}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <EmptyState
            icon={Search}
            title="No matching materials found"
            description={`No document matching "${searchQuery}" was found in your study library.`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="Your study library is empty"
            description="Upload your first academic PDF document to begin building your grounded knowledge base."
          />
        )}
      </div>
    </div>
  );
};
