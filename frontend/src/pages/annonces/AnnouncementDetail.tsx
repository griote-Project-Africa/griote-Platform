import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncementById } from '@/services/announcement.service';
import { ArrowLeft, Calendar, Megaphone } from 'lucide-react';
import type { Announcement } from '@/types/announcement';

// ── Helpers ────────────────────────────────────────────────────────────────

function getAnnouncementColor(seed: string): string {
  const palette = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
  return palette[Math.abs(h) % palette.length];
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </div>
      <div className="h-72 bg-slate-200 w-full" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-5">
        <div className="h-10 bg-slate-200 rounded w-4/5" />
        <div className="h-px bg-slate-200 my-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-4 bg-slate-200 rounded ${i % 3 === 2 ? 'w-4/5' : 'w-full'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

const AnnouncementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: announcement, isLoading, error } = useQuery<Announcement>({
    queryKey: ['announcement', id],
    queryFn: () => getAnnouncementById(parseInt(id!, 10)),
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) return <Skeleton />;

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-destructive/8 flex items-center justify-center mb-6">
            <Megaphone className="w-10 h-10 text-destructive/40" />
          </div>
          <h2 className="text-xl font-bold mb-2">Annonce introuvable</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Cette annonce n'existe pas ou n'est plus disponible.
          </p>
          <button
            onClick={() => navigate('/annonces')}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary
                       bg-primary/8 hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux annonces
          </button>
        </div>
      </div>
    );
  }

  const color = getAnnouncementColor(announcement.title);
  const date = announcement.published_at || announcement.created_at;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Breadcrumb bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <button
            onClick={() => navigate('/annonces')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Retour aux annonces
          </button>
        </div>
      </div>

      {/* ── Cover image ──────────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden" style={{ height: '22rem' }}>
        {announcement.cover_image_url ? (
          <img
            src={announcement.cover_image_url}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}44)` }}
          >
            <span
              className="text-9xl font-black text-white/15 select-none"
              style={{ fontFamily: 'serif' }}
            >
              {announcement.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* ── Article content ──────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {announcement.is_featured && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider
                           text-primary bg-primary/8 px-3 py-1 rounded-full mb-5">
            À la une
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
          {announcement.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
          {announcement.author && (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: color }}
            >
              {getInitials(announcement.author.first_name, announcement.author.last_name)}
            </div>
          )}
          <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
            {announcement.author && (
              <span className="font-semibold text-foreground text-sm">
                {announcement.author.first_name} {announcement.author.last_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {formatDate(date)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div
          className="prose prose-slate prose-sm sm:prose-base max-w-none mt-8
                     prose-headings:font-extrabold prose-headings:tracking-tight
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-blockquote:border-l-primary
                     prose-code:bg-slate-100 prose-code:rounded prose-code:px-1"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <button
            onClick={() => navigate('/annonces')}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground
                       hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Toutes les annonces
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
