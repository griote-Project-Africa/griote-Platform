import { useState, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { useForm } from "react-hook-form";
import { X, Upload, ImageIcon, Star, Save } from "lucide-react";
import { toast } from "sonner";
import type { AnnouncementFormData } from "./types";
import RichTextEditor from "../../../components/editor/RichTextEditor";

type FormFields = { title: string; content: string };

const MAX_CHARS = 1500;

interface Props {
  initialValues?: {
    title: string;
    content: string;
    cover_image_url?: string | null;
    is_featured?: boolean;
  };
  loading?: boolean;
  onSubmit: (data: AnnouncementFormData) => void;
  onCancel?: () => void;
}

export default function AnnouncementForm({ initialValues, loading, onSubmit, onCancel }: Props) {
  const [cover, setCover] = useState<File | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFeatured, setIsFeatured] = useState(initialValues?.is_featured ?? false);

  const form = useForm<FormFields>({
    defaultValues: {
      title: initialValues?.title ?? "",
      content: initialValues?.content ?? "",
    },
  });

  useEffect(() => {
    if (!cover && initialValues?.cover_image_url) {
      setCoverPreview(initialValues.cover_image_url);
    }
  }, [initialValues, cover]);

  // ── File handlers ─────────────────────────────────────────────────────────

  const applyFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Image trop lourde (max 5 MB)"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Fichier non supporté"); return; }
    setCover(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = (data: FormFields) => {
    if (!data.title?.trim()) { toast.error("Le titre est requis"); return; }
    const textContent = (data.content ?? "").replace(/<[^>]+>/g, '').trim();
    if (!textContent) { toast.error("Le contenu est requis"); return; }
    onSubmit({ title: data.title.trim(), content: data.content ?? "", cover, is_featured: isFeatured });
  };

  const contentValue = form.watch("content");
  const charCount = (contentValue ?? "").replace(/<[^>]+>/g, '').length;
  const charPct = Math.min(100, Math.round((charCount / MAX_CHARS) * 100));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 py-2">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="ann-title" className="text-sm font-medium">
          Titre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ann-title"
          value={form.watch("title")}
          onChange={(e) => form.setValue("title", e.target.value, { shouldDirty: true })}
          placeholder="Ex : Bourses d'études 2025 — Candidature ouverte"
          className="text-base font-medium h-11"
        />
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          <ImageIcon className="h-4 w-4" />
          Image d'illustration
          <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>

        {coverPreview ? (
          <div className="relative rounded-xl overflow-hidden border">
            <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover" />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <label className="bg-black/60 hover:bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
                Changer
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
                />
              </label>
              <button
                type="button"
                onClick={() => { setCover(undefined); setCoverPreview(null); }}
                className="bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-7 w-7 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">Cliquez</span> ou glissez une image
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG — max 5 MB</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
            />
          </label>
        )}
      </div>

      {/* Content editor */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          Contenu <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          value={contentValue}
          onChange={html => form.setValue("content", html, { shouldDirty: true })}
          placeholder="Rédigez votre annonce de façon claire et concise…"
          variant="announcement"
          minHeight={200}
          maxLength={MAX_CHARS}
        />
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${charPct >= 100 ? 'bg-destructive' : charPct >= 80 ? 'bg-amber-500' : 'bg-primary'}`}
              style={{ width: `${charPct}%` }}
            />
          </div>
          <p className="text-xs text-right text-muted-foreground">
            Recommandé : moins de {MAX_CHARS} caractères
          </p>
        </div>
      </div>

      {/* is_featured toggle */}
      <div className="flex items-center justify-between rounded-xl border px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <Star className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
          <div>
            <p className="text-sm font-medium">Mettre en avant</p>
            <p className="text-xs text-muted-foreground">Afficher en priorité sur la page d'accueil</p>
          </div>
        </div>
        <Switch
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="button"
          onClick={form.handleSubmit(handleSubmit)}
          disabled={loading}
          className="min-w-28"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? "En cours…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
