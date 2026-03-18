export type ArticleStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export interface Article {
  article_id: number;
  author_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  cover_image_url?: string | null;
  status: ArticleStatus;
  rejection_reason?: string | null;
  read_time_minutes?: number | null;
  view_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  category?: {
    category_id: number;
    name: string;
    slug?: string;
  };
  tags?: Array<{
    tag_id: number;
    name: string;
    slug?: string;
  }>;
}

export interface CreateArticleData {
  title: string;
  subtitle?: string;
  content: string;
  category_id?: string;
  tags?: string[];
  status?: ArticleStatus;
  cover?: File;
}

export interface UpdateArticleData {
  title?: string;
  subtitle?: string;
  content?: string;
  category_id?: string;
  tags?: string[];
  cover?: File;
}

export interface ArticleFilter {
  status?: ArticleStatus;
  category_id?: string;
  author_id?: string;
}
