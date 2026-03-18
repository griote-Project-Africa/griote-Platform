import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Archive, FileText, Megaphone, ArrowRight, Lock,
  FolderOpen, Calendar, Clock, HardDrive,
} from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import EcosystemSection from '@/components/home/EcosystemSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import FaqSection from '@/components/home/FaqSection';
import { getPublicDepots } from '@/services/depot.service';
import { getArticles } from '@/services/article.service';
import { getPublishedAnnouncements } from '@/services/announcement.service';
import type { Depot } from '@/services/admin.service';
import type { Article } from '@/types/article';
import type { Announcement } from '@/types/announcement';
import { useAuth } from '@/auth/useAuth';

// ── helpers ────────────────────────────────────────────────────────────────

function hashColor(seed: string): string {
  const palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#6366f1', '#f97316'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
  return palette[Math.abs(h) % palette.length];
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').slice(0, 120);
}

// ── Card skeletons ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card animate-pulse overflow-hidden">
      <div className="h-36 bg-muted/40" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Lock overlay ───────────────────────────────────────────────────────────

function LockCard({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link to={href} className="group relative rounded-xl border border-border bg-card overflow-hidden flex flex-col hover:border-amber-500/40 hover:shadow-md transition-all duration-200">
      {children}
      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/5 transition-colors" />
    </Link>
  );
}

// ── Depot card ─────────────────────────────────────────────────────────────

function DepotCard({ depot }: { depot: Depot }) {
  const color = hashColor(depot.title);
  const docCount = (depot as any).documents?.length ?? (depot as any).document_count ?? 0;
  return (
    <LockCard href={`/depots/${depot.depot_id}`}>
      <div className="h-36 overflow-hidden shrink-0">
        {(depot as any).preview_image ? (
          <img src={(depot as any).preview_image} alt={depot.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}99, ${color}44)` }}>
            <span className="text-5xl font-black text-white/20 select-none" style={{ fontFamily: 'serif' }}>
              {depot.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        {(depot as any).category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1">
            <FolderOpen className="h-2.5 w-2.5" />{(depot as any).category.name}
          </span>
        )}
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{depot.title}</p>
        {depot.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{depot.description}</p>
        )}
        <div className="flex items-center gap-3 mt-auto pt-2 text-[11px] text-muted-foreground">
          {docCount > 0 && <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{docCount} doc{docCount > 1 ? 's' : ''}</span>}
          {(depot as any).total_size ? <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" />{formatFileSize((depot as any).total_size)}</span> : null}
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-amber-500 font-medium group-hover:underline">
          Voir le dépôt <ArrowRight className="h-3 w-3" />
        </span>
        <span className="flex items-center gap-1 text-muted-foreground/60">
          <Lock className="h-3 w-3" /> Connexion requise
        </span>
      </div>
    </LockCard>
  );
}

// ── Article card ───────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  const color = hashColor(article.title);
  return (
    <LockCard href={`/articles/${article.article_id}`}>
      <div className="h-36 overflow-hidden shrink-0">
        {article.cover_image_url ? (
          <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}99, ${color}44)` }}>
            <span className="text-5xl font-black text-white/20 select-none" style={{ fontFamily: 'serif' }}>
              {article.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        {article.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">{article.category.name}</span>
        )}
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{article.title}</p>
        {article.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{article.subtitle}</p>
        )}
        <div className="flex items-center gap-3 mt-auto pt-2 text-[11px] text-muted-foreground">
          {article.author && <span>{article.author.first_name} {article.author.last_name}</span>}
          {article.read_time_minutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.read_time_minutes} min</span>}
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-amber-500 font-medium group-hover:underline">
          Lire l'article <ArrowRight className="h-3 w-3" />
        </span>
        <span className="flex items-center gap-1 text-muted-foreground/60">
          <Lock className="h-3 w-3" /> Connexion requise
        </span>
      </div>
    </LockCard>
  );
}

// ── Announcement card ──────────────────────────────────────────────────────

function AnnouncementCard({ ann }: { ann: Announcement }) {
  const color = hashColor(ann.title);
  const excerpt = ann.content ? stripHtml(ann.content) : '';
  const date = ann.published_at || ann.created_at;
  return (
    <LockCard href={`/annonces/${ann.announcement_id}`}>
      <div className="h-36 overflow-hidden shrink-0">
        {ann.cover_image_url ? (
          <img src={ann.cover_image_url} alt={ann.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}99, ${color}44)` }}>
            <span className="text-5xl font-black text-white/20 select-none" style={{ fontFamily: 'serif' }}>
              {ann.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        {ann.is_featured && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">À la une</span>
        )}
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{ann.title}</p>
        {excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{excerpt}…</p>
        )}
        <div className="flex items-center gap-1 mt-auto pt-2 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div className="px-4 pb-3 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-amber-500 font-medium group-hover:underline">
          Voir l'annonce <ArrowRight className="h-3 w-3" />
        </span>
        <span className="flex items-center gap-1 text-muted-foreground/60">
          <Lock className="h-3 w-3" /> Connexion requise
        </span>
      </div>
    </LockCard>
  );
}

// ── Platform Preview Section ───────────────────────────────────────────────

type Tab = 'depots' | 'articles' | 'annonces';

const TABS: { key: Tab; label: string; icon: React.FC<any>; href: string; cta: string }[] = [
  { key: 'depots',   label: 'Dépôts',   icon: Archive,   href: '/depots',   cta: 'Explorer tous les dépôts' },
  { key: 'articles', label: 'Articles', icon: FileText,  href: '/articles', cta: 'Voir tous les articles' },
  { key: 'annonces', label: 'Annonces', icon: Megaphone, href: '/annonces', cta: 'Toutes les annonces' },
];

function PlatformPreviewSection() {
  const [activeTab, setActiveTab] = useState<Tab>('depots');
  const { isAuthenticated } = useAuth();

  const { data: depots = [], isLoading: loadingDepots } = useQuery<Depot[]>({
    queryKey: ['public-depots-preview'],
    queryFn: getPublicDepots,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: articles = [], isLoading: loadingArticles } = useQuery<Article[]>({
    queryKey: ['articles-preview'],
    queryFn: () => getArticles({ status: 'PUBLISHED' }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: annonces = [], isLoading: loadingAnnonces } = useQuery<Announcement[]>({
    queryKey: ['annonces-preview'],
    queryFn: getPublishedAnnouncements,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const current = TABS.find(t => t.key === activeTab)!;
  const isLoading = activeTab === 'depots' ? loadingDepots : activeTab === 'articles' ? loadingArticles : loadingAnnonces;

  const items = activeTab === 'depots'
    ? depots.slice(0, 4)
    : activeTab === 'articles'
    ? articles.slice(0, 4)
    : annonces.slice(0, 4);

  // Stats
  const stats = [
    { label: 'Dépôts disponibles', value: depots.length || '—', icon: Archive },
    { label: 'Articles publiés', value: articles.length || '—', icon: FileText },
    { label: 'Annonces actives', value: annonces.length || '—', icon: Megaphone },
  ];

  return (
    <section className="py-20 lg:py-28 border-t border-border bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 lg:mb-14 flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-amber-500">
              Aperçu de la plateforme
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight">
              Explorez les contenus
              <br />
              <span className="text-primary">de la plateforme</span>
            </h2>
          </div>
          {!isAuthenticated && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 max-w-xs">
              <Lock className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Link to="/inscription" className="font-semibold text-amber-500 hover:underline">Créez un compte</Link>
                {' '}pour accéder aux détails et télécharger.
              </p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors"
                style={{
                  borderColor: activeTab === tab.key ? 'hsl(43 96% 56%)' : 'transparent',
                  color: activeTab === tab.key ? 'hsl(43 96% 56%)' : 'hsl(var(--muted-foreground))',
                }}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : items.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-muted/40 border border-border flex items-center justify-center mb-4">
                  <current.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Aucun contenu disponible pour le moment.</p>
              </div>
            )
            : activeTab === 'depots'
            ? (items as Depot[]).map(d => <DepotCard key={d.depot_id} depot={d} />)
            : activeTab === 'articles'
            ? (items as Article[]).map(a => <ArticleCard key={a.article_id} article={a} />)
            : (items as Announcement[]).map(a => <AnnouncementCard key={a.announcement_id} ann={a} />)
          }
        </div>

        {/* See all CTA */}
        <div className="text-center">
          <Link
            to={current.href}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            {current.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <EcosystemSection />
      <PlatformPreviewSection />
      <CallToActionSection />
      <FaqSection />
    </div>
  );
}
