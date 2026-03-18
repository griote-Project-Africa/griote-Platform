import api from '../lib/axios';
import type { Article, CreateArticleData, UpdateArticleData, ArticleFilter } from '../types/article';

export async function getArticles(filter?: ArticleFilter): Promise<Article[]> {
  const params: Record<string, string> = {};
  if (filter?.status)      params.status      = filter.status;
  if (filter?.category_id) params.category_id = filter.category_id;
  if (filter?.author_id)   params.author_id   = filter.author_id;

  const res = await api.get<Article[]>('/articles', { params });
  return res.data;
}

export async function getArticleById(id: number | string): Promise<Article> {
  const res = await api.get<Article>(`/articles/${id}`);
  return res.data;
}

export async function createArticle(data: CreateArticleData): Promise<Article> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  if (data.subtitle)    formData.append('subtitle', data.subtitle);
  if (data.category_id) formData.append('category_id', data.category_id);
  if (data.status)      formData.append('status', data.status);
  if (data.tags?.length) formData.append('tags', JSON.stringify(data.tags));
  if (data.cover)       formData.append('cover', data.cover);

  const res = await api.post<Article>('/articles', formData);
  return res.data;
}

export async function updateArticle(id: number | string, data: UpdateArticleData): Promise<Article> {
  const formData = new FormData();
  if (data.title       !== undefined) formData.append('title',       data.title);
  if (data.subtitle    !== undefined) formData.append('subtitle',    data.subtitle);
  if (data.content     !== undefined) formData.append('content',     data.content);
  if (data.category_id !== undefined) formData.append('category_id', data.category_id);
  if (data.tags        !== undefined) formData.append('tags',        JSON.stringify(data.tags));
  if (data.cover) formData.append('cover', data.cover);

  const res = await api.patch<Article>(`/articles/${id}`, formData);
  return res.data;
}

export async function submitArticle(id: number | string): Promise<Article> {
  const res = await api.patch<Article>(`/articles/${id}/submit`);
  return res.data;
}

export async function approveArticle(id: number | string): Promise<Article> {
  const res = await api.patch<Article>(`/articles/${id}/approve`);
  return res.data;
}

export async function rejectArticle(id: number | string, reason?: string): Promise<Article> {
  const res = await api.patch<Article>(`/articles/${id}/reject`, { reason });
  return res.data;
}

export async function archiveArticle(id: number | string): Promise<Article> {
  const res = await api.patch<Article>(`/articles/${id}/archive`);
  return res.data;
}

export async function deleteArticle(id: number | string): Promise<void> {
  await api.delete(`/articles/${id}`);
}

export async function getMyArticles(): Promise<Article[]> {
  const res = await api.get<Article[]>('/articles/mine');
  return res.data;
}

export async function countArticles(filter?: ArticleFilter): Promise<number> {
  const params: Record<string, string> = {};
  if (filter?.status)      params.status      = filter.status;
  if (filter?.category_id) params.category_id = filter.category_id;
  if (filter?.author_id)   params.author_id   = filter.author_id;

  const res = await api.get<{ count: number }>('/articles/count', { params });
  return res.data.count;
}
