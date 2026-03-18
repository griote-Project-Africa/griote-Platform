import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/services/article.service';
import { getCategories } from '@/services/category.service';
import { getTags } from '@/services/tag.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search, ArrowRight, Calendar, Clock,
  Tags, X, FileText, User,
} from 'lucide-react';
import type { Article } from '@/types/article';
import type { Category } from '@/types/category';
import type { Tag } from '@/types/tag';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getArticleColor(seed: string): string {
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

// ── Skeleton ───────────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-6 bg-slate-200 rounded-full" />
          <div className="h-3 bg-slate-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="h-64 lg:h-80 bg-slate-200" />
        <div className="p-8 space-y-4">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-7 bg-slate-200 rounded w-full" />
          <div className="h-7 bg-slate-200 rounded w-4/5" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-10 bg-slate-200 rounded-xl w-36 mt-6" />
        </div>
      </div>
    </div>
  );
}

// ── Featured card ──────────────────────────────────────────────────────────

function FeaturedArticle({ article }: { article: Article }) {
  const color = getArticleColor(article.title);

  return (
    <Link to={`/articles/${article.article_id}`} className="group block">
      <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden
                          hover:shadow-xl hover:border-primary/25 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Image */}
          <div className="relative h-64 lg:h-full min-h-64 overflow-hidden">
            {article.cover_image_url ? (
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                  {article.title[0]?.toUpperCase()}
                </span>
              </div>
            )}
            {/* À la une label */}
            <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest
                             bg-accent text-white px-2.5 py-1 rounded-full">
              À la une
            </span>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              {article.category && (
                <span className="inline-block text-xs font-semibold uppercase tracking-wider
                                 text-primary bg-primary/8 px-3 py-1 rounded-full">
                  {article.category.name}
                </span>
              )}

              <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground leading-snug
                             group-hover:text-primary transition-colors duration-200">
                {article.title}
              </h2>

              {article.subtitle && (
                <p className="text-foreground/60 text-sm leading-relaxed line-clamp-3">
                  {article.subtitle}
                </p>
              )}

              {(article.tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {article.tags?.slice(0, 4).map((tag) => (
                    <span key={tag.tag_id}
                      className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {article.author && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px]
                                     font-bold flex items-center justify-center">
                      {getInitials(article.author.first_name, article.author.last_name)}
                    </span>
                    <span>{article.author.first_name} {article.author.last_name}</span>
                  </div>
                )}
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(article.created_at)}
                </span>
                {article.read_time_minutes && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.read_time_minutes} min
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary
                              group-hover:gap-2.5 transition-all duration-200">
                Lire l'article
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Article card ───────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  const color = getArticleColor(article.title);

  return (
    <Link to={`/articles/${article.article_id}`} className="group block h-full">
      <article className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden
                          hover:shadow-lg hover:border-primary/25 transition-all duration-300">

        {/* Cover */}
        <div className="relative aspect-video overflow-hidden">
          {article.cover_image_url ? (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}
            >
              <span
                className="text-5xl font-black text-white/20 select-none"
                style={{ fontFamily: 'serif' }}
              >
                {article.title[0]?.toUpperCase()}
              </span>
            </div>
          )}

          {article.category && (
            <span className="absolute bottom-2.5 left-2.5 text-[11px] font-semibold
                             bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
              {article.category.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug text-sm
                         group-hover:text-primary transition-colors duration-200">
            {article.title}
          </h3>

          {article.subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {article.author ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px]
                                   font-bold flex items-center justify-center shrink-0">
                    {getInitials(article.author.first_name, article.author.last_name)}
                  </span>
                  <span className="truncate max-w-[100px]">
                    {article.author.first_name} {article.author.last_name}
                  </span>
                </div>
              ) : (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Griote
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {article.read_time_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.read_time_minutes} min
                </span>
              )}
              <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center
                              group-hover:bg-primary transition-colors duration-200">
                <ArrowRight className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

const Articles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'az'>('recent');

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['articles-published'],
    queryFn: () => getArticles({ status: 'PUBLISHED' }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const toggleTag = (id: string) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedCategory !== 'all' || selectedTags.length > 0;

  const filtered = useMemo(() => {
    let result = articles.filter((a) => {
      const matchSearch =
        !searchTerm.trim() ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat =
        selectedCategory === 'all' ||
        String(a.category?.category_id) === selectedCategory;

      const matchTags =
        selectedTags.length === 0 ||
        a.tags?.some((t) => selectedTags.includes(String(t.tag_id)));

      return matchSearch && matchCat && matchTags;
    });

    if (sortBy === 'recent') result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === 'oldest') result = result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (sortBy === 'az') result = result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [articles, searchTerm, selectedCategory, selectedTags, sortBy]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">
            Revue éditoriale
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Articles
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-xl">
            Réflexions académiques, essais critiques et analyses produites par et pour l'Afrique.
          </p>
        </div>
      </div>

      {/* ── Filter bar (sticky) ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Row 1 : search + sort + count */}
          <div className="flex items-center gap-3 py-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Rechercher un article…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus-visible:ring-primary/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
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
              <span className="font-semibold text-foreground">{isLoading ? '—' : filtered.length}</span> article{filtered.length !== 1 ? 's' : ''}
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
              Tous
            </button>

            {categories.map((cat) => (
              <button
                key={String(cat.category_id)}
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
                    {selectedTags.length > 0 && (
                      <button onClick={() => setSelectedTags([])} className="text-xs text-destructive hover:underline">
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

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           text-xs font-semibold border border-slate-200
                           text-muted-foreground hover:border-slate-300 hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Row 3 : active chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pb-2.5 overflow-x-auto scrollbar-none">
              <span className="text-[11px] text-muted-foreground shrink-0">Filtres :</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-full font-medium">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] px-2.5 py-1 rounded-full font-medium">
                  {categories.find((c) => String(c.category_id) === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedTags.map((tid) => (
                <span key={tid} className="inline-flex items-center gap-1 bg-accent/10 text-accent text-[11px] px-2.5 py-1 rounded-full font-medium">
                  {tags.find((t) => String(t.tag_id) === tid)?.name}
                  <button onClick={() => toggleTag(tid)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Loading */}
        {isLoading && (
          <>
            <FeaturedSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)}
            </div>
          </>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-primary/30" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Aucun article trouvé</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              {hasActiveFilters
                ? 'Essayez de modifier vos filtres.'
                : 'Aucun article publié pour le moment.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">
                <X className="w-4 h-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        )}

        {/* Featured */}
        {!isLoading && featured && <FeaturedArticle article={featured} />}

        {/* Grid */}
        {!isLoading && rest.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-base font-bold text-foreground whitespace-nowrap">
                {hasActiveFilters ? 'Résultats' : 'Tous les articles'}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {rest.length} article{rest.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((article) => (
                <ArticleCard key={article.article_id} article={article} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
