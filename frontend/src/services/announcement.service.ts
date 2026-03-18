import api from '../lib/axios';
import type { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '../types/announcement';

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const res = await api.get<Announcement[]>('/announcements');
  return res.data;
}

export async function getAnnouncementById(id: number): Promise<Announcement> {
  const res = await api.get<Announcement>(`/announcements/${id}`);
  return res.data;
}

export async function getAllAnnouncementsForAdmin(): Promise<Announcement[]> {
  const res = await api.get<Announcement[]>('/announcements/admin/all');
  return res.data;
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
  if (data.priority    !== undefined) formData.append('priority', String(data.priority));
  if (data.cover) formData.append('cover', data.cover);

  const res = await api.post<Announcement>('/announcements', formData);
  return res.data;
}

export async function updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<Announcement> {
  const formData = new FormData();
  if (data.title       !== undefined) formData.append('title', data.title);
  if (data.content     !== undefined) formData.append('content', data.content);
  if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured));
  if (data.priority    !== undefined) formData.append('priority', String(data.priority));
  if (data.cover) formData.append('cover', data.cover);

  const res = await api.patch<Announcement>(`/announcements/${id}`, formData);
  return res.data;
}

export async function publishAnnouncement(id: number): Promise<Announcement> {
  const res = await api.patch<Announcement>(`/announcements/${id}/publish`);
  return res.data;
}

export async function archiveAnnouncement(id: number): Promise<Announcement> {
  const res = await api.patch<Announcement>(`/announcements/${id}/archive`);
  return res.data;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await api.delete(`/announcements/${id}`);
}
