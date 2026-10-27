import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { UploadDropzone } from '../components/materials/UploadDropzone';
import { MaterialRow } from '../components/materials/MaterialRow';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { PageHeader } from '../components/common/PageHeader';
import { Alert } from '../components/common/Alert';
import { materialsApi } from '../api/materials';

export const MaterialsPage = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

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
    setNotice(null);
    try {
      const res = await materialsApi.uploadMaterial(file);
      if (res.success) {
        await fetchMaterials();
        setNotice(`“${file.name}” was added to your library.`);
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
    setNotice(null);
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
    <div className="space-y-10">
      <PageHeader
        eyebrow="Library"
        title="Study materials"
        description="Everything Synapse knows comes from the documents you add here. Each PDF is analyzed and indexed so you can ask questions about it."
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchMaterials} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <UploadDropzone onUpload={handleUpload} isUploading={uploading} />

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}
      {notice && <Alert variant="success" onDismiss={() => setNotice(null)}>{notice}</Alert>}

      <section aria-labelledby="library-heading" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2 id="library-heading" className="text-3xl text-black">
            Your documents
            <span className="ml-2 align-middle inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-md border-2 border-black bg-sage font-sans text-base font-bold tabular-nums">{materials.length}</span>
          </h2>

          {materials.length > 0 && (
            <div className="w-full sm:w-72">
              <Input
                id="material-search"
                type="search"
                aria-label="Search materials by file name"
                placeholder="Search by file name"
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
          <ul className="bg-white border-2 border-black rounded-xl shadow-brut divide-y-2 divide-black">
            {filteredMaterials.map((material) => (
              <MaterialRow
                key={material.id}
                material={material}
                onAskAi={() => navigate('/chat')}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        ) : searchQuery ? (
          <EmptyState
            icon={Search}
            title="No matching materials"
            description={`Nothing in your library matches “${searchQuery}”.`}
            actionLabel="Clear search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="Your library is empty"
            description="Upload your first academic PDF above to start building your knowledge base."
          />
        )}
      </section>
    </div>
  );
};
