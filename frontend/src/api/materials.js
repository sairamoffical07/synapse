import { apiClient } from './client';

export const materialsApi = {
  uploadMaterial: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient('/study-materials/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getMaterials: async () => {
    return apiClient('/study-materials', {
      method: 'GET',
    });
  },

  getMaterialById: async (id) => {
    return apiClient(`/study-materials/${id}`, {
      method: 'GET',
    });
  },

  getMaterialStatus: async (id) => {
    return apiClient(`/study-materials/${id}/status`, {
      method: 'GET',
    });
  },

  deleteMaterial: async (id) => {
    return apiClient(`/study-materials/${id}`, {
      method: 'DELETE',
    });
  },
};
