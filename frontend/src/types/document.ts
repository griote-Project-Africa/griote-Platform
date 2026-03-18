export interface Document {
  document_id: string;
  depot_id: string;
  owner_id: string;
  filename: string;
  url: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  preview_url?: string;
  download_count?: number;
  file_extension?: string;
  created_at: string;
  updated_at: string;
}
