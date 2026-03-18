import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDepotById } from '@/services/depot.service';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, FileText, Download, Calendar,
  FolderOpen, Tag, HardDrive, Eye, BookOpen,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getDepotColor(title: string): string {
  const palette = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  ];
  let h = 0;
  for (let i = 0; i < title.length; i++) { h = (h << 5) - h + title.charCodeAt(i); h |= 0; }
  return palette[Math.abs(h) % palette.length];
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf'].includes(ext)) return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['xls', 'xlsx'].includes(ext)) return '📊';
  if (['ppt', 'pptx'].includes(ext)) return '📋';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
  return '📁';
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="aspect-video w-full bg-slate-200 rounded-2xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DepotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: depot, isLoading, error } = useQuery({
    queryKey: ['depot', id],
    queryFn: () => getDepotById(id!),
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) return <DetailSkeleton />;

  if (error || !depot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-destructive/8 flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-destructive/40" />
          </div>
          <h2 className="text-xl font-bold mb-2">Dépôt introuvable</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Ce dépôt n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/depots')} variant="outline" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux dépôts
          </Button>
        </div>
      </div>
    );
  }

  const color = getDepotColor(depot.title);
  const docCount = depot.documents?.length ?? 0;
  const hasDownloadableDoc = depot.documents?.some((d: any) => d.file_url);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 max-w-5xl">
          <button
            onClick={() => navigate('/depots')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour aux dépôts
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">

        {/* ── Cover image ──────────────────────────────────────────────── */}
        <div className="w-full aspect-video max-h-80 rounded-2xl overflow-hidden mb-8 shadow-sm">
          {depot.preview_image ? (
            <img
              src={depot.preview_image}
              alt={depot.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}
            >
              <span
                className="text-8xl font-black text-white/20 select-none"
                style={{ fontFamily: 'serif' }}
              >
                {depot.title[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* ── Content grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                {depot.title}
              </h1>
            </div>

            {/* Description */}
            {depot.description && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Description
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {depot.description}
                </p>
              </div>
            )}

            {/* Documents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Documents ({docCount})
                </h2>
                {hasDownloadableDoc && docCount > 1 && (
                  <span className="text-xs text-muted-foreground">
                    Téléchargez chaque fichier séparément
                  </span>
                )}
              </div>

              {docCount === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl text-sm text-muted-foreground">
                  <BookOpen className="h-5 w-5 shrink-0" />
                  Aucun document joint à ce dépôt.
                </div>
              ) : (
                <div className="space-y-2">
                  {depot.documents?.map((doc: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3.5 bg-white border border-slate-200
                                 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <span className="text-xl shrink-0">{getFileIcon(doc.filename ?? '')}</span>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {doc.filename}
                        </p>
                        {doc.file_size && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatFileSize(doc.file_size)}
                          </p>
                        )}
                      </div>

                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          download={doc.filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg gap-1.5 shrink-0">
                            <Download className="h-3.5 w-3.5" />
                            Télécharger
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — metadata sidebar */}
          <div className="space-y-4">

            {/* Category */}
            {depot.category && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Catégorie
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  {depot.category.name}
                </div>
              </div>
            )}

            {/* Tags */}
            {(depot.tags?.length ?? 0) > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {depot.tags?.map((tag: any) => (
                    <span
                      key={tag.tag_id}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1
                                 bg-accent/10 text-accent rounded-full font-medium"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Informations
              </p>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5 text-foreground/70">
                  <FileText className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <span>{docCount} document{docCount !== 1 ? 's' : ''}</span>
                </div>

                {depot.total_size ? (
                  <div className="flex items-center gap-2.5 text-foreground/70">
                    <HardDrive className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <span>{formatFileSize(depot.total_size)}</span>
                  </div>
                ) : null}

                {typeof depot.view_count === 'number' && (
                  <div className="flex items-center gap-2.5 text-foreground/70">
                    <Eye className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                    <span>{depot.view_count} consultation{depot.view_count !== 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="flex items-center gap-2.5 text-foreground/70">
                  <Calendar className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <span>
                    {new Date(depot.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
