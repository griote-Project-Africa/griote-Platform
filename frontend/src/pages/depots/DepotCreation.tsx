import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Upload, X, FileText, Tag as TagIcon, FolderOpen, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCategories } from '@/services/category.service';
import { getTags } from '@/services/tag.service';
import { createDepot, uploadDepotDocument } from '@/services/depot.service';
import type { Category } from '@/types/category';
import type { Tag } from '@/types/tag';
import RichTextEditor from '@/components/editor/RichTextEditor';

interface DepotFormData {
  title: string;
  subtitle?: string;
  description: string;
  category_id: string;
}

const DepotCreation: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DepotFormData>({
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      category_id: '',
    },
  });

  const contentValue = form.watch('description');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch {
        toast.error('Impossible de charger les données');
      }
    };
    fetchData();
  }, []);

  // ── Image handlers ─────────────────────────────────────────────────────────

  const applyPreviewImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('Image trop lourde (max 5 MB)'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Fichier non supporté'); return; }
    setPreviewImage(file);
    setPreviewImageUrl(URL.createObjectURL(file));
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyPreviewImage(file);
  };

  // ── Document handlers ──────────────────────────────────────────────────────

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (values: DepotFormData) => {
    if (!values.title.trim()) { toast.error('Le titre est requis'); return; }
    if (!values.category_id) { toast.error('Veuillez sélectionner une catégorie'); return; }

    setIsSubmitting(true);
    try {
      const depot = await createDepot({
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        tags: selectedTags,
        preview_image: previewImage || undefined,
      });

      for (const doc of documents) {
        await uploadDepotDocument(depot.depot_id, doc);
      }

      toast.success('Dépôt créé avec succès. Il est en attente de validation.');
      window.location.href = '/mon-compte';
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Impossible de créer le dépôt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 lg:py-8">
      <div className="container mx-auto px-0 lg:px-4 max-w-6xl">
        <Card className="h-full flex flex-col">
          <CardHeader className="px-4 lg:px-6">
            <CardTitle className="text-xl lg:text-2xl">Créer un dépôt de connaissances</CardTitle>
            <p className="text-muted-foreground text-sm lg:text-base">
              Organisez et partagez vos documents et informations de manière structurée
            </p>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto px-4 lg:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                  {/* ── Left sidebar ────────────────────────────────────── */}
                  <div className="lg:col-span-1 space-y-5">

                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre du dépôt</FormLabel>
                          <FormControl>
                            <Input placeholder="Titre de votre dépôt" {...field} className="text-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subtitle */}
                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sous-titre <span className="text-muted-foreground font-normal">(optionnel)</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder="Sous-titre du dépôt" {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <FolderOpen className="h-3.5 w-3.5" /> Catégorie
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm font-medium">
                        <TagIcon className="h-3.5 w-3.5" />
                        Tags
                        {selectedTags.length > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground font-normal">
                            {selectedTags.length} sélectionné{selectedTags.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </Label>

                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
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

                      <Input
                        placeholder="Rechercher un tag…"
                        value={tagSearch}
                        onChange={e => setTagSearch(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-0.5 border rounded-md p-1">
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

                    {/* Preview image */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm font-medium">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Image de prévisualisation
                        <span className="text-muted-foreground font-normal">(optionnel)</span>
                      </Label>

                      {previewImageUrl ? (
                        <div className="relative rounded-lg overflow-hidden border">
                          <img src={previewImageUrl} alt="Aperçu" className="w-full h-40 object-cover" />
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <label className="bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded cursor-pointer transition-colors">
                              Changer
                              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) applyPreviewImage(f); }} />
                            </label>
                            <button
                              type="button"
                              onClick={() => { setPreviewImage(null); setPreviewImageUrl(null); }}
                              className="bg-black/60 hover:bg-black/80 text-white rounded p-1 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDraggingImage ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
                          onDragOver={e => { e.preventDefault(); setIsDraggingImage(true); }}
                          onDragLeave={() => setIsDraggingImage(false)}
                          onDrop={handleImageDrop}
                        >
                          <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
                          <p className="text-xs text-muted-foreground text-center px-2">
                            Glisser ou <span className="text-primary font-medium">cliquer</span>
                            <br />PNG, JPG — max 5 MB
                          </p>
                          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) applyPreviewImage(f); }} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* ── Right column — Description + Documents ───────────── */}
                  <div className="lg:col-span-2 space-y-5">

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description du dépôt</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Décrivez le contenu de votre dépôt…"
                              variant="article"
                              minHeight={300}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Documents */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-1.5 text-sm font-medium">
                        <FileText className="h-3.5 w-3.5" />
                        Documents
                        {documents.length > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground font-normal">
                            {documents.length} fichier{documents.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </Label>

                      {documents.length > 0 && (
                        <div className="space-y-2">
                          {documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-background border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30 hover:border-primary/50 transition-colors border-border">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          <span className="text-primary font-medium">Cliquez</span> ou glissez des fichiers
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">PDF, DOC, DOCX, TXT, ZIP (max 100 MB)</p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                          className="hidden"
                          multiple
                          onChange={handleDocumentChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <CardFooter className="flex justify-between border-t pt-6 px-0">
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création en cours…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer le dépôt
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepotCreation;
