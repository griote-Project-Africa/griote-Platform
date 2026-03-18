import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Tag as TagIcon, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag } from '../../../services/tag.service';
import type { Tag } from '../../../types/tag';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TagForm from './TagForm';
import { AdminPageHeader, AdminEmptyState, GoldButton, SearchInput } from '@/components/admin';

// deterministic color per tag name
const TAG_COLORS = [
  { bg: 'hsl(217 91% 60% / .15)', border: 'hsl(217 91% 60% / .3)', text: 'hsl(217 91% 70%)' },
  { bg: 'hsl(142 71% 45% / .15)', border: 'hsl(142 71% 45% / .3)', text: 'hsl(142 71% 55%)' },
  { bg: 'hsl(258 90% 66% / .15)', border: 'hsl(258 90% 66% / .3)', text: 'hsl(258 90% 75%)' },
  { bg: 'hsl(43  96% 56% / .15)', border: 'hsl(43  96% 56% / .3)', text: 'hsl(43  96% 65%)' },
  { bg: 'hsl(189 94% 43% / .15)', border: 'hsl(189 94% 43% / .3)', text: 'hsl(189 94% 55%)' },
  { bg: 'hsl(330 81% 55% / .15)', border: 'hsl(330 81% 55% / .3)', text: 'hsl(330 81% 65%)' },
];

function tagColor(name: string) {
  const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TAG_COLORS[code % TAG_COLORS.length];
}

function TagChip({
  tag, onEdit, onDelete,
}: { tag: Tag; onEdit: () => void; onDelete: () => void }) {
  const c = tagColor(tag.name);
  return (
    <div
      className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border text-sm font-medium transition-all duration-100 hover:shadow-sm"
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      <TagIcon className="h-3 w-3 shrink-0" />
      <span className="leading-none">{tag.name}</span>
      {/* action icons — appear on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
        <button
          onClick={onEdit}
          title="Modifier"
          className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-white/20 transition"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          title="Supprimer"
          className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-red-500/30 text-red-400 transition"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function AdminTags() {
  const [selected, setSelected]         = useState<Tag | null>(null);
  const [isCreateOpen, setCreateOpen]   = useState(false);
  const [isEditOpen, setEditOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [search, setSearch]             = useState('');

  const qc = useQueryClient();

  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string }) => createTag(data.name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); toast.success('Tag créé'); setCreateOpen(false); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMut = useMutation({
    mutationFn: (p: { id: number; data: { name: string } }) => updateTag(p.id, p.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); toast.success('Tag mis à jour'); setEditOpen(false); setSelected(null); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tags'] }); toast.success('Tag supprimé'); setDeleteTarget(null); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const filtered = useMemo(() =>
    tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase())),
    [tags, search],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tags"
        description="Labels transversaux pour catégoriser finement les contenus"
        action={
          <GoldButton icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Nouveau tag
          </GoldButton>
        }
      />

      {/* Search + count */}
      <div className="flex items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Filtrer les tags…" className="max-w-sm" />
        <span className="text-xs text-muted-foreground shrink-0">
          {filtered.length} / {tags.length} tag{tags.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tags cloud */}
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-8 rounded-full bg-muted/20 animate-pulse" style={{ width: `${60 + (i * 17) % 60}px` }} />
          ))}
        </div>
      ) : !filtered.length ? (
        <AdminEmptyState
          title={search ? 'Aucun tag trouvé' : 'Aucun tag'}
          description={search ? 'Essayez un autre terme.' : 'Créez votre premier tag pour étiqueter les contenus.'}
          icon={<TagIcon className="h-6 w-6" />}
          action={!search ? (
            <GoldButton icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              Créer un tag
            </GoldButton>
          ) : undefined}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {/* Search within section */}
          {search && (
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
              <Search className="h-3 w-3" />
              Résultats pour « {search} »
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {filtered.map(tag => (
              <TagChip
                key={tag.tag_id}
                tag={tag}
                onEdit={() => { setSelected(tag); setEditOpen(true); }}
                onDelete={() => setDeleteTarget(tag)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border">
            Survolez un tag pour faire apparaître les actions d'édition et suppression.
          </p>
        </div>
      )}

      {/* Create */}
      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un tag</DialogTitle>
            <DialogDescription>Choisissez un nom court et descriptif.</DialogDescription>
          </DialogHeader>
          <TagForm loading={createMut.isPending} onSubmit={data => createMut.mutate(data)} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
            <DialogDescription>Renommez «{selected?.name}».</DialogDescription>
          </DialogHeader>
          {selected && (
            <TagForm
              initialValues={{ name: selected.name }}
              loading={updateMut.isPending}
              onSubmit={data => updateMut.mutate({ id: selected.tag_id, data })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le tag «{deleteTarget?.name}» ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce tag sera retiré de tous les contenus auxquels il est associé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.tag_id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
