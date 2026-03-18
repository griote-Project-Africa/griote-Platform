import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import {
  X, Upload, ImageIcon, Tag as TagIcon, FolderOpen, Clock, FileText,
  BookOpen, Send, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { createArticle, updateArticle } from '../../../services/article.service';
import { getCategories } from '../../../services/category.service';
import { getTags } from '../../../services/tag.service';
import type { Article, CreateArticleData, UpdateArticleData } from '../../../types/article';
import type { Category } from '../../../types/category';
import type { Tag } from '../../../types/tag';
import RichTextEditor from '../../../components/editor/RichTextEditor';

interface ArticleFormProps {
  article?: Article;
  onSuccess: () => void;
  onCancel: () => void;
  canPublish?: boolean;
}

type FormFields = {
  title: string;
  subtitle: string;
  content: string;
  category_id: string;
};

// Estimate reading time (200 wpm avg)
function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const ArticleForm: React.FC<ArticleFormProps> = ({ article, onSuccess, onCancel, canPublish = true }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormFields>({
    defaultValues: {
      title: article?.title || '',
      subtitle: article?.subtitle || '',
      content: article?.content || '',
      category_id: article?.category_id?.toString() || '',
    },
  });

  const contentValue = form.watch('content') ?? '';
  const readTime = estimateReadTime(contentValue);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tgs);
        if (article?.tags) {
          setSelectedTags(article.tags.map(t => t.tag_id.toString()));
        }
      } catch {
        toast.error('Impossible de charger les données');
      }
    };
    fetchData();
  }, [article]);

  useEffect(() => {
    if (article?.cover_image_url) setCoverPreview(article.cover_image_url);
  }, [article]);

  // ── Cover image handlers ──────────────────────────────────────────────────

  const applyFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop lourde (max 5 MB)'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Fichier non supporté'); return; }
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (values: FormFields, status?: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
    if (!values.title?.trim()) { toast.error('Le titre est requis'); return; }
    const textContent = (values.content ?? '').replace(/<[^>]+>/g, '').trim();
    if (!textContent) { toast.error('Le contenu est requis'); return; }

    setIsSubmitting(true);
    try {
      const base = {
        title: values.title.trim(),
        subtitle: values.subtitle?.trim() || undefined,
        content: values.content ?? '',
        category_id: values.category_id && values.category_id !== '__none__' ? values.category_id : undefined,
        tags: selectedTags,
        cover: cover ?? undefined,
      };

      if (article) {
        await updateArticle(article.article_id, base as UpdateArticleData);
        toast.success('Article mis à jour');
      } else {
        await createArticle({ ...base, status: status || 'DRAFT' } as CreateArticleData);
        toast.success('Article créé');
      }
      onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Impossible de sauvegarder l'article";
      toast.error(msg);


    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {article ? "Modifier l'article" : 'Rédiger un article'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSubmit(form.getValues(), 'DRAFT')}
            disabled={isSubmitting}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Brouillon
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onSubmit(form.getValues(), 'PENDING')}
            disabled={isSubmitting}
            className="bg-primary"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Soumettre
          </Button>
          {article && canPublish && (
            <Button
              type="button"
              size="sm"
              onClick={() => onSubmit(form.getValues(), 'PUBLISHED')}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Publier
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6 items-start">

        {/* ── Main content area (2/3) ──────────────────────────────────────── */}
        <div className="flex-1 space-y-5">

          {/* Title */}
          <div>
            <Input
              value={form.watch('title')}
              onChange={(e) => form.setValue('title', e.target.value, { shouldDirty: true })}
              placeholder="Titre de l'article…"
              className="text-2xl font-bold border-0 border-b rounded-none px-0 pb-3 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 h-auto"
            />
          </div>

          {/* Subtitle */}
          <div>
            <Textarea
              {...form.register('subtitle')}
              placeholder="Sous-titre ou chapô (optionnel)…"
              rows={2}
              className="border-0 border-b rounded-none px-0 resize-none focus-visible:ring-0 focus-visible:border-primary text-muted-foreground placeholder:text-muted-foreground/40"
            />
          </div>

          <Separator />

          {/* Editor */}
          <div>
            <RichTextEditor
              value={contentValue}
              onChange={(html) => form.setValue('content', html, { shouldDirty: true })}
              placeholder="Commencez à rédiger votre article… Sélectionnez du texte pour le formater."
              variant="article"
              minHeight={420}
              className="min-h-[420px]"
            />
          </div>
        </div>

        {/* ── Metadata sidebar (1/3) ───────────────────────────────────────── */}
        <aside className="w-64 shrink-0 border rounded-lg bg-muted/20">
          <div className="p-5 space-y-6">

            {/* Read time estimate */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background rounded-lg px-3 py-2 border">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Temps de lecture estimé : <strong>{readTime} min</strong></span>
            </div>

            {/* Cover image */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Image de couverture
              </Label>

              {coverPreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={coverPreview} alt="Cover" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCover(null); setCoverPreview(null); }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <label className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded cursor-pointer transition-colors">
                    Changer
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    Glisser ou <span className="text-primary font-medium">cliquer</span>
                    <br />PNG, JPG — max 5 MB
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <FolderOpen className="h-4 w-4" />
                Catégorie
              </Label>
              <Select
                onValueChange={(v) => form.setValue('category_id', v)}
                defaultValue={form.getValues('category_id')}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Aucune —</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <TagIcon className="h-4 w-4" />
                Tags
                {selectedTags.length > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {selectedTags.length} sélectionné{selectedTags.length > 1 ? 's' : ''}
                  </span>
                )}
              </Label>

              {/* Selected tags as chips */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedTags.map(id => {
                    const tag = tags.find(t => t.tag_id.toString() === id);
                    if (!tag) return null;
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs cursor-pointer"
                        onClick={() => setSelectedTags(prev => prev.filter(t => t !== id))}
                      >
                        {tag.name}
                        <X className="h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Tag search + list */}
              <Input
                placeholder="Rechercher un tag…"
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                className="h-7 text-xs"
              />
              <div className="max-h-36 overflow-y-auto space-y-0.5">
                {filteredTags.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Aucun tag</p>
                ) : (
                  filteredTags.map(tag => {
                    const id = tag.tag_id.toString();
                    const active = selectedTags.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedTags(prev =>
                          active ? prev.filter(t => t !== id) : [...prev, id]
                        )}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {active ? '✓ ' : '+ '}{tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <Separator />

            {/* Infos */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>
                  {contentValue.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length} mots
                </span>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticleForm;
