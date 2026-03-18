import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicDepots } from '@/services/depot.service';
import { getCategories } from '@/services/category.service';
import { getTags } from '@/services/tag.service';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FileText, Search, ArrowRight, Calendar,
  FolderOpen, Tags, X, BookOpen, SlidersHorizontal,
} from 'lucide-react';
import type { Depot } from '@/services/admin.service';
import type { Category } from '@/types/category';
import type { Tag } from '@/types/tag';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function timeAgo(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
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

// ── Skeleton card ──────────────────────────────────────────────────────────

function DepotSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 w-14 bg-slate-200 rounded-full" />
          <div className="h-5 w-10 bg-slate-200 rounded-full" />
        </div>
        <div className="h-8 bg-slate-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ── Depot card ─────────────────────────────────────────────────────────────

function DepotCard({ depot, onClick }: { depot: Depot; onClick: () => void }) {
  const color = getDepotColor(depot.title);
  const docCount = depot.documents?.length ?? 0;

  return (
    <article
      onClick={onClick}
      className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden
                 hover:shadow-lg hover:border-primary/25 transition-all duration-300 cursor-pointer"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden">
        {depot.preview_image ? (
          <img
            src={depot.preview_image}
            alt={depot.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}66)` }}
          >
            <span
              className="text-6xl font-black text-white/20 select-none leading-none"
              style={{ fontFamily: 'serif' }}
            >
              {depot.title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Category overlay */}
        {depot.category && (
          <span className="absolute bottom-2.5 left-2.5 text-[11px] font-semibold
                           bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {depot.category.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug text-sm">
          {depot.title}
        </h3>

        {depot.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {depot.description}
          </p>
        )}

        {/* Tags */}
        {(depot.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {depot.tags?.slice(0, 3).map((tag: any) => (
              <span
                key={tag.tag_id}
                className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium"
              >
                {tag.name}
              </span>
            ))}
            {(depot.tags?.length ?? 0) > 3 && (
              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                +{(depot.tags?.length ?? 0) - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {docCount} doc{docCount !== 1 ? 's' : ''}
            </span>
            {depot.total_size ? <span>{formatFileSize(depot.total_size)}</span> : null}
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {timeAgo(depot.created_at)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <div
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium
                     text-primary bg-primary/5 group-hover:bg-primary group-hover:text-white
                     py-2 rounded-xl transition-all duration-200"
        >
          Consulter
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </article>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ExploreDepots() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'az'>('recent');

  const { data: depots = [], isLoading } = useQuery<Depot[]>({
    queryKey: ['public-depots'],
    queryFn: getPublicDepots,
    retry: 1,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const toggleTag = (tagId: string) =>
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTags([]);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedTags.length > 0;

  const filteredDepots = useMemo(() => {
    let result = depots.filter((depot) => {
      const matchesSearch =
        !searchQuery.trim() ||
        depot.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        depot.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        String(depot.category?.category_id) === selectedCategory ||
        String(depot.category_id) === selectedCategory;

      const matchesTags =
        selectedTags.length === 0 ||
        depot.tags?.some((tag: any) => selectedTags.includes(String(tag.tag_id)));

      return matchesSearch && matchesCategory && matchesTags;
    });

    if (sortBy === 'recent') result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === 'oldest') result = result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (sortBy === 'az') result = result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [depots, searchQuery, selectedCategory, selectedTags, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
            Bibliothèque ouverte
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Explorer les dépôts
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl">
            Découvrez les ressources culturelles et connaissances partagées par la communauté Griote.
          </p>
        </div>
      </div>

      {/* ── Filter bar (sticky) ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1 : search + sort */}
          <div className="flex items-center gap-3 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Rechercher un dépôt…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus-visible:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-36 h-9 text-sm bg-slate-50 border-slate-200 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="oldest">Plus anciens</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground shrink-0 hidden sm:block">
              <span className="font-semibold text-foreground">{isLoading ? '—' : filteredDepots.length}</span> dépôt{filteredDepots.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Row 2 : category tabs + tags popover */}
          <div className="flex items-center gap-1 pb-2.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-slate-100'
              }`}
            >
              Toutes
            </button>

            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === String(cat.category_id) ? 'all' : String(cat.category_id)
                  )
                }
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === String(cat.category_id)
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {/* Tags popover */}
            {tags.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={`shrink-0 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                text-xs font-semibold border transition-colors ${
                      selectedTags.length > 0
                        ? 'border-accent text-accent bg-accent/5'
                        : 'border-slate-200 text-muted-foreground hover:border-slate-300 hover:text-foreground'
                    }`}
                  >
                    <Tags className="h-3.5 w-3.5" />
                    Tags
                    {selectedTags.length > 0 && (
                      <span className="bg-accent text-white text-[10px] rounded-full px-1.5 font-bold">
                        {selectedTags.length}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tags
                    </p>
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="text-xs text-destructive hover:underline"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.tag_id}
                        variant={selectedTags.includes(String(tag.tag_id)) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs select-none"
                        onClick={() => toggleTag(String(tag.tag_id))}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <button
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                hasActiveFilters
                  ? 'border-slate-200 text-muted-foreground hover:border-slate-300 hover:text-foreground'
                  : 'hidden'
              }`}
              onClick={clearFilters}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          </div>

          {/* Row 3 : active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pb-2.5 overflow-x-auto scrollbar-none">
              <span className="text-[11px] text-muted-foreground shrink-0">Filtres :</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-full font-medium">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] px-2.5 py-1 rounded-full font-medium">
                  {categories.find((c) => String(c.category_id) === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-primary/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedTags.map((tagId) => (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1 bg-accent/10 text-accent text-[11px] px-2.5 py-1 rounded-full font-medium"
                >
                  {tags.find((t) => String(t.tag_id) === tagId)?.name}
                  <button onClick={() => toggleTag(tagId)} className="hover:text-accent/70">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <DepotSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredDepots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-primary/30" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {hasActiveFilters ? 'Aucun résultat' : 'Aucun dépôt disponible'}
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              {hasActiveFilters
                ? 'Essayez de modifier vos filtres.'
                : 'Revenez bientôt — la communauté Griote enrichit ses collections chaque jour.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">
                <X className="w-4 h-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        )}

        {/* Depot grid */}
        {!isLoading && filteredDepots.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground mb-5 sm:hidden">
              <span className="font-semibold text-foreground">{filteredDepots.length}</span> dépôt{filteredDepots.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDepots.map((depot) => (
                <DepotCard
                  key={depot.depot_id}
                  depot={depot}
                  onClick={() => navigate(`/depots/${depot.depot_id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
