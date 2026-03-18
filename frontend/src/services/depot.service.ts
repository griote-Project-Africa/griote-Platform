import api from '../lib/axios';
import type { Depot } from './admin.service';

export interface CreateDepotData {
  title: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  preview_image?: File;
  documents?: File[];
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
}

export interface UpdateDepotData {
  title?: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  preview_image?: File;
  documents?: File[];
}

export async function getDepots(): Promise<Depot[]> {
  const response = await api.get('/depots');
  return response.data;
}

export async function getMyDepots(): Promise<Depot[]> {
  const response = await api.get('/depots', {
    params: { owner_id: 'me' }
  });
  return response.data;
}

export async function getPublicDepots(): Promise<Depot[]> {
  const response = await api.get('/depots', {
    params: { status: 'PUBLISHED' }
  });
  return response.data;
}

export async function getDepotById(id: string): Promise<Depot> {
  const response = await api.get(`/depots/${id}`);
  return response.data;
}

export async function createDepot(data: CreateDepotData): Promise<Depot> {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.category_id) {
    formData.append('category_id', data.category_id);
  }
  // Backend expects tag_ids, not tags
  if (data.tags && data.tags.length > 0) {
    formData.append('tag_ids', JSON.stringify(data.tags));
  }
  if (data.preview_image) {
    formData.append('preview_image', data.preview_image);
  }
  if (data.status) {
    formData.append('status', data.status);
  }
  if (data.documents) {
    data.documents.forEach((doc) => {
      formData.append('documents', doc);
    });
  }

  const response = await api.post('/depots', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function updateDepot(id: string, data: UpdateDepotData): Promise<Depot> {
  const formData = new FormData();
  if (data.title) {
    formData.append('title', data.title);
  }
  if (data.description) {
    formData.append('description', data.description);
  }
  if (data.category_id) {
    formData.append('category_id', data.category_id);
  }
  // Backend expects tag_ids, not tags
  if (data.tags && data.tags.length > 0) {
    formData.append('tag_ids', JSON.stringify(data.tags));
  }
  if (data.preview_image) {
    formData.append('preview_image', data.preview_image);
  }
  if (data.documents) {
    data.documents.forEach((doc) => {
      formData.append('documents', doc);
    });
  }

  const response = await api.put(`/depots/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function deleteDepot(id: string): Promise<void> {
  await api.delete(`/depots/${id}`);
}

export async function uploadDepotDocument(depotId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('document', file);
  await api.post(`/depots/${depotId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function deleteDepotDocument(depotId: string, documentId: string): Promise<void> {
  await api.delete(`/depots/${depotId}/documents/${documentId}`);
}

export async function submitDepotForReview(depotId: string): Promise<Depot> {
  const response = await api.patch(`/depots/${depotId}/submit`);
  return response.data;
}

export async function approveDepot(depotId: string): Promise<Depot> {
  const response = await api.patch(`/depots/${depotId}/approve`);
  return response.data;
}

export async function rejectDepot(depotId: string, reason: string): Promise<Depot> {
  const response = await api.patch(`/depots/${depotId}/reject`, { reason });
  return response.data;
}

export async function archiveDepot(depotId: string): Promise<Depot> {
  const response = await api.patch(`/depots/${depotId}/archive`);
  return response.data;
}

export async function unarchiveDepot(depotId: string): Promise<Depot> {
  const response = await api.patch(`/depots/${depotId}/unarchive`);
  return response.data;
}
