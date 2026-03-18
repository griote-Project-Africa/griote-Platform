// src/services/admin.service.ts
import api from '../lib/axios';
import type { User } from './auth.service';

export interface AdminFilters {
  page?: number;
  limit?: number;
  role?: 'USER' | 'ADMIN';
  email?: string;
  name?: string;
}

export interface UsersListResponse {
  users: User[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export interface PlatformStats {
  totalUsers: number;
  verifiedUsers: number;
  totalDepots: number;
  totalDocuments: number;
}

export interface Category {
  category_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  tag_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Depot {
  depot_id: string;
  owner_id: string;
  title: string;
  description?: string;
  category_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  documents?: Document[];
  tags?: Tag[];
  preview_image?: string;
  total_size?: number;
  view_count?: number;
  download_count?: number;
}

// ============ Types for new stats ============

export interface TrendData {
  trend: { date: string; count: number }[];
}

export interface TopDepot {
  depot_id: number;
  title: string;
  view_count: number;
  download_count: number;
  category: string;
  created_at: string;
}

export interface TopDepotsResponse {
  depots: TopDepot[];
}

export interface TopDocument {
  document_id: number;
  filename: string;
  file_type: string;
  download_count: number;
  file_size: number;
  depot_title: string;
  created_at: string;
}

export interface TopDocumentsResponse {
  documents: TopDocument[];
}

export interface CategoryCount {
  category_id: number;
  name: string;
  count: number;
}

export interface CategoriesResponse {
  categories: CategoryCount[];
}

export interface TagCount {
  tag_id: number;
  name: string;
  count: number;
}

export interface TagsResponse {
  tags: TagCount[];
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface StatusesResponse {
  statuses: StatusCount[];
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface RolesResponse {
  roles: RoleCount[];
}

export interface VerificationRateResponse {
  totalUsers: number;
  verifiedUsers: number;
  verificationRate: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalDepots: number;
  totalDocuments: number;
  categories: CategoryCount[];
  statuses: StatusCount[];
  roles: RoleCount[];
  verificationRate: number;
  verifiedUsers: number;
  topViewedDepots: TopDepot[];
  topDownloadedDepots: TopDepot[];
}

// USERS
export async function getAllUsers(filters: AdminFilters = {}): Promise<UsersListResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.role) params.append('role', filters.role);
  if (filters.email) params.append('email', filters.email);
  if (filters.name) params.append('name', filters.name);

  const res = await api.get<UsersListResponse>(`/users?${params.toString()}`);
  return res.data;
}

export async function getUserById(userId: string): Promise<User> {
  const res = await api.get<User>(`/users/${userId}`);
  return res.data;
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const res = await api.put<User>(`/users/${userId}`, data);
  return res.data;
}

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
  const res = await api.patch<User>(`/users/${userId}/role`, { role });
  return res.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}

export async function createUser(data: { email: string; password: string; first_name: string; last_name: string }): Promise<User> {
  const res = await api.post<User>('/users', data);
  return res.data;
}

// ============ Basic STATS (existing) ============
export async function getTotalUsers(): Promise<{ totalUsers: number }> {
  const res = await api.get<{ totalUsers: number }>('/users/total-users');
  return res.data;
}

export async function getVerifiedUsers(): Promise<{ verifiedUsers: number }> {
  const res = await api.get<{ verifiedUsers: number }>('/users/verified-users');
  return res.data;
}

export async function getTotalDepots(): Promise<{ totalDepots: number }> {
  const res = await api.get<{ totalDepots: number }>('/depots/stats/total-depots');
  return res.data;
}

export async function getTotalDocuments(): Promise<{ totalDocuments: number }> {
  const res = await api.get<{ totalDocuments: number }>('/depots/stats/total-documents');
  return res.data;
}

// ============ NEW: Temporal Trends ============
export async function getUserRegistrationsTrend(period: string = 'day', days: number = 30): Promise<TrendData> {
  const res = await api.get<TrendData>(`/stats/users/registrations?period=${period}&days=${days}`);
  return res.data;
}

export async function getDepotCreationsTrend(period: string = 'day', days: number = 30): Promise<TrendData> {
  const res = await api.get<TrendData>(`/stats/depots/creations?period=${period}&days=${days}`);
  return res.data;
}

// ============ NEW: Popularity Statistics ============
export async function getTopViewedDepots(limit: number = 10): Promise<TopDepotsResponse> {
  const res = await api.get<TopDepotsResponse>(`/stats/depots/top-viewed?limit=${limit}`);
  return res.data;
}

export async function getTopDownloadedDepots(limit: number = 10): Promise<TopDepotsResponse> {
  const res = await api.get<TopDepotsResponse>(`/stats/depots/top-downloaded?limit=${limit}`);
  return res.data;
}

export async function getTopDownloadedDocuments(limit: number = 10): Promise<TopDocumentsResponse> {
  const res = await api.get<TopDocumentsResponse>(`/stats/documents/top-downloaded?limit=${limit}`);
  return res.data;
}

// ============ NEW: Category and Tag Breakdown ============
export async function getDepotsByCategory(): Promise<CategoriesResponse> {
  const res = await api.get<CategoriesResponse>('/stats/depots/by-category');
  return res.data;
}

export async function getDepotsByTag(): Promise<TagsResponse> {
  const res = await api.get<TagsResponse>('/stats/depots/by-tag');
  return res.data;
}

export async function getDepotsByStatus(): Promise<StatusesResponse> {
  const res = await api.get<StatusesResponse>('/stats/depots/by-status');
  return res.data;
}

// ============ NEW: User Statistics ============
export async function getUsersByRole(): Promise<RolesResponse> {
  const res = await api.get<RolesResponse>('/stats/users/by-role');
  return res.data;
}

export async function getVerificationRate(): Promise<VerificationRateResponse> {
  const res = await api.get<VerificationRateResponse>('/stats/users/verification-rate');
  return res.data;
}

// ============ Combined Dashboard ============
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<DashboardStats>('/stats/dashboard');
  return res.data;
}

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/categories');
  return res.data;
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  const res = await api.post<Category>('/categories', data);
  return res.data;
}

export async function updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
  const res = await api.patch<Category>(`/categories/${categoryId}`, data);
  return res.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await api.delete(`/categories/${categoryId}`);
}

// TAGS
export async function getTags(): Promise<Tag[]> {
  const res = await api.get<Tag[]>('/tags');
  return res.data;
}

export async function createTag(data: { name: string }): Promise<Tag> {
  const res = await api.post<Tag>('/tags', data);
  return res.data;
}

export async function updateTag(tagId: string, data: Partial<Tag>): Promise<Tag> {
  const res = await api.patch<Tag>(`/tags/${tagId}`, data);
  return res.data;
}

export async function deleteTag(tagId: string): Promise<void> {
  await api.delete(`/tags/${tagId}`);
}

// DEPOTS
export async function getDepots(): Promise<Depot[]> {
  const res = await api.get<Depot[]>('/depots');
  return res.data;
}

export async function deleteDepot(depotId: string): Promise<void> {
  await api.delete(`/depots/${depotId}`);
}

export async function approveDepot(depotId: string): Promise<Depot> {
  const res = await api.patch<Depot>(`/depots/${depotId}/approve`);
  return res.data;
}

export async function rejectDepot(depotId: string, reason?: string): Promise<Depot> {
  const res = await api.patch<Depot>(`/depots/${depotId}/reject`, { reason });
  return res.data;
}

export async function archiveDepot(depotId: string): Promise<Depot> {
  const res = await api.patch<Depot>(`/depots/${depotId}/archive`);
  return res.data;
}

export async function unarchiveDepot(depotId: string): Promise<Depot> {
  const res = await api.patch<Depot>(`/depots/${depotId}/unarchive`);
  return res.data;
}
