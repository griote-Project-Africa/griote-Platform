import { useState, useRef, useEffect } from 'react';
import { X, Image, Plus, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '@/services/category.service';
import { getTags } from '@/services/tag.service';
import { createDepot, updateDepot, submitDepotForReview } from '@/services/depot.service';
import type { Depot } from '@/services/admin.service';
import type { Category } from '@/types/category';
import type { Tag } from '@/types/tag';

interface DepotFormDialogProps {
  open: boolean;
  onClose: () => void;
  depot?: Depot;
}

export function DepotFormDialog({ open, onClose, depot }: DepotFormDialogProps) {
  const queryClient = useQueryClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!depot;

  useEffect(() => {
    if (open) {
      if (depot) {
        setTitle(depot.title || '');
        setDescription(depot.description || '');
        setCategoryId(depot.category_id ? String(depot.category_id) : '');
        setSelectedTagIds(depot.tags?.map((t: any) => String(t.tag_id)) || []);
        setCoverPreview(depot.preview_image || null);
        setCoverImage(null);
        setNewDocuments([]);
      } else {
        setTitle('');
        setDescription('');
        setCategoryId('');
        setSelectedTagIds([]);
        setCoverImage(null);
        setCoverPreview(null);
        setNewDocuments([]);
      }
    }
  }, [depot, open]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewDocuments(prev => [...prev, ...files]);
    if (docsInputRef.current) docsInputRef.current.value = '';
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async (submitForReview: boolean) => {
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && depot) {
        await updateDepot(depot.depot_id, {
          title: title.trim(),
          description: description.trim() || undefined,
          category_id: categoryId || undefined,
          tags: selectedTagIds,
          preview_image: coverImage || undefined,
          documents: newDocuments.length > 0 ? newDocuments : undefined,
        });
        if (submitForReview) {
          await submitDepotForReview(depot.depot_id);
          toast.success('Dépôt modifié et soumis pour validation');
        } else {
          toast.success('Dépôt mis à jour');
        }
      } else {
        await createDepot({
          title: title.trim(),
          description: description.trim() || undefined,
          category_id: categoryId || undefined,
          tags: selectedTagIds,
          preview_image: coverImage || undefined,
          documents: newDocuments.length > 0 ? newDocuments : undefined,
          status: submitForReview ? 'PENDING' : 'DRAFT',
        });
        toast.success(
          submitForReview ? 'Dépôt soumis pour validation' : 'Brouillon enregistré'
        );
      }
      queryClient.invalidateQueries({ queryKey: ['my-depots'] });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le dépôt' : 'Créer un nouveau dépôt'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div>
            <Label htmlFor="depot-title">
              Titre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="depot-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du dépôt"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="depot-desc">Description</Label>
            <Textarea
              id="depot-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le contenu de ce dépôt…"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Category */}
          <div>
            <Label>Catégorie</Label>
            <Select
              value={categoryId || 'none'}
              onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune catégorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => {
                  const selected = selectedTagIds.includes(String(tag.tag_id));
                  return (
                    <button
                      key={tag.tag_id}
                      type="button"
                      onClick={() => toggleTag(String(tag.tag_id))}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-all duration-150 ${
                        selected
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-transparent text-foreground/60 border-border hover:border-accent/50 hover:text-foreground'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cover Image */}
          <div>
            <Label>Image de couverture</Label>
            <div className="mt-2">
              {coverPreview ? (
                <div className="relative inline-block">
                  <img
                    src={coverPreview}
                    alt="Couverture"
                    className="h-32 rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="h-24 w-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:bg-muted/20 transition-colors"
                >
                  <Image className="h-6 w-6" />
                  <span className="text-sm">Cliquer pour ajouter une image</span>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          {/* Documents */}
          <div>
            <Label>Documents</Label>

            {/* Existing documents in edit mode */}
            {isEdit && depot?.documents && depot.documents.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">Documents existants :</p>
                {depot.documents.map((doc: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{doc.filename}</span>
                    {doc.file_size && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {(doc.file_size / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New documents */}
            {newDocuments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {isEdit && (
                  <p className="text-xs text-muted-foreground font-medium">Nouveaux documents :</p>
                )}
                {newDocuments.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg text-sm"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => setNewDocuments(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => docsInputRef.current?.click()}
              className="mt-2 w-full border-2 border-dashed border-border rounded-lg p-3 flex items-center justify-center gap-2 text-muted-foreground text-sm hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter des documents
            </button>
            <input
              ref={docsInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleDocsChange}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="sm:mr-auto">
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sauvegarder brouillon
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Soumettre pour validation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
