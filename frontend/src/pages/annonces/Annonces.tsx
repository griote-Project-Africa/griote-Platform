import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getPublishedAnnouncements } from '@/services/announcement.service';
import { Search, Megaphone, Calendar, ArrowRight } from 'lucide-react';
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

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// ── Skeletons ──────────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 animate-pulse">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 h-72 bg-slate-200" />
        <div className="md:w-1/2 p-8 flex flex-col justify-center gap-4">
          <div className="h-4 w-16 bg-slate-200 rounded-full" />
          <div className="h-8 bg-slate-200 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-9 w-36 bg-slate-200 rounded-xl mt-2" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-200 rounded w-16" />
      </div>
    </div>
  );
}

// ── Featured announcement (large horizontal card) ──────────────────────────

function FeaturedAnnouncement({ announcement }: { announcement: Announcement }) {
  const navigate = useNavigate();
  const color = getAnnouncementColor(announcement.title);
  const plain = stripHtml(announcement.content);
  const excerpt = plain.length > 220 ? plain.slice(0, 220) + '…' : plain;
  const date = announcement.published_at || announcement.created_at;

  return (
    <div
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/annonces/${announcement.announcement_id}`)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-1/2 h-72 md:h-auto overflow-hidden shrink-0">
          {announcement.cover_image_url ? (
            <img
              src={announcement.cover_image_url}
              alt={announcement.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

        {/* Content */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/8
                           px-3 py-1 rounded-full w-fit mb-4">
            À la une
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight mb-3">
            {announcement.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-4">
            {excerpt}
          </p>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {announcement.author && (
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: color }}
                >
                  {getInitials(announcement.author.first_name, announcement.author.last_name)}
                </div>
                <span className="text-xs font-medium text-foreground">
                  {announcement.author.first_name} {announcement.author.last_name}
                </span>
              </div>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(date)}
            </span>
          </div>
          <span className="flex items-center gap-2 text-sm font-semibold text-primary w-fit
                           group-hover:gap-3 transition-all">
            Lire l'annonce
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Regular grid card ──────────────────────────────────────────────────────

function AnnouncementGridCard({ announcement }: { announcement: Announcement }) {
  const navigate = useNavigate();
  const color = getAnnouncementColor(announcement.title);
  const plain = stripHtml(announcement.content);
  const excerpt = plain.length > 120 ? plain.slice(0, 120) + '…' : plain;
  const date = announcement.published_at || announcement.created_at;

  return (
    <div
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden
                 hover:shadow-md hover:-translate-y-0.5 transition-all"
      onClick={() => navigate(`/annonces/${announcement.announcement_id}`)}
    >
      <div className="aspect-video overflow-hidden">
        {announcement.cover_image_url ? (
          <img
            src={announcement.cover_image_url}
            alt={announcement.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}44)` }}
          >
            <span
              className="text-6xl font-black text-white/15 select-none"
              style={{ fontFamily: 'serif' }}
            >
              {announcement.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {announcement.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

const Annonces = () => {
  const [search, setSearch] = useState('');

  const { data: allAnnouncements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: getPublishedAnnouncements,
  });

  const featured = useMemo(
    () => allAnnouncements.find(a => a.is_featured) ?? null,
    [allAnnouncements],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allAnnouncements.filter(a =>
      !q || a.title.toLowerCase().includes(q) || stripHtml(a.content).toLowerCase().includes(q),
    );
  }, [allAnnouncements, search]);

  const isSearching = search.length > 0;
  const gridAnnouncements = isSearching
    ? filtered
    : filtered.filter(a => a.announcement_id !== featured?.announcement_id);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Communauté Griote
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Annonces &amp; Opportunités
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Bourses, événements, formations et autres opportunités pour la communauté académique africaine.
          </p>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une annonce…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {isLoading ? (
          <div className="space-y-10">
            <FeaturedSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-primary/40" />
            </div>
            <h2 className="text-lg font-bold mb-1">Aucune annonce trouvée</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {isSearching ? 'Essayez un autre mot-clé.' : 'Aucune annonce publiée pour le moment.'}
            </p>
          </div>

        ) : (
          <div className="space-y-10">

            {/* Featured */}
            {!isSearching && featured && (
              <FeaturedAnnouncement announcement={featured} />
            )}

            {/* Grid */}
            {gridAnnouncements.length > 0 && (
              <div>
                {!isSearching && featured && (
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                    Toutes les annonces
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridAnnouncements.map(a => (
                    <AnnouncementGridCard key={a.announcement_id} announcement={a} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Annonces;
