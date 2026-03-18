export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AnnouncementAuthor {
  user_id: number;
  first_name: string;
  last_name: string;
}

export interface Announcement {
  announcement_id: number;
  author_id: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  status: AnnouncementStatus;
  is_featured: boolean;
  priority: number;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  author?: AnnouncementAuthor;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  is_featured?: boolean;
  priority?: number;
  cover?: File;
}

export interface UpdateAnnouncementData {
  title?: string;
  content?: string;
  is_featured?: boolean;
  priority?: number;
  cover?: File;
}
