import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FolderOpen, Plus, Edit2, Trash2, Hash } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../services/category.service';
import type { Category } from '../../../types/category';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CategoryForm from './CategoryForm';
import {
  AdminPageHeader, AdminEmptyState, GoldButton, SearchInput,
  ActionButton, AdminTable, AdminTableHeader, AdminTableBody,
  AdminTableRow, AdminTableHead, AdminTableCell,
} from '@/components/admin';

export default function AdminCategories() {
  const [selected, setSelected]       = useState<Category | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [search, setSearch]           = useState('');

  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMut = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Catégorie créée'); setCreateOpen(false); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: number; name: string }) => updateCategory(payload.id, payload.name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Catégorie mise à jour'); setEditOpen(false); setSelected(null); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Catégorie supprimée'); setDeleteTarget(null); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const filtered = useMemo(() =>
    categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Catégories"
        description="Organiser les contenus par catégorie"
        action={
          <GoldButton icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Nouvelle catégorie
          </GoldButton>
        }
      />

      {/* Search + count */}
      <div className="flex items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une catégorie…" className="max-w-sm" />
        <span className="text-xs text-muted-foreground shrink-0">
          {filtered.length} / {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : !filtered.length ? (
        <AdminEmptyState
          title="Aucune catégorie"
          description="Créez votre première catégorie pour organiser les contenus."
          icon={<FolderOpen className="h-6 w-6" />}
          action={
            <GoldButton icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              Créer une catégorie
            </GoldButton>
          }
        />
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <tr>
              <AdminTableHead>#</AdminTableHead>
              <AdminTableHead>Nom</AdminTableHead>
              <AdminTableHead className="hidden sm:table-cell">Créée le</AdminTableHead>
              <AdminTableHead className="text-right">Actions</AdminTableHead>
            </tr>
          </AdminTableHeader>
          <AdminTableBody>
            {filtered.map((cat, i) => (
              <AdminTableRow key={cat.category_id}>
                <AdminTableCell className="w-12">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                    <Hash className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </AdminTableCell>
                <AdminTableCell className="hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {new Date((cat as any).created_at ?? Date.now()).toLocaleDateString('fr-FR')}
                  </span>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <ActionButton
                      icon={<Edit2 className="h-3.5 w-3.5" />}
                      title="Modifier"
                      onClick={() => { setSelected(cat); setEditOpen(true); }}
                    />
                    <ActionButton
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      title="Supprimer"
                      onClick={() => setDeleteTarget(cat)}
                      variant="danger"
                    />
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}

      {/* Create */}
      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une catégorie</DialogTitle>
            <DialogDescription>Donnez un nom unique à cette catégorie.</DialogDescription>
          </DialogHeader>
          <CategoryForm loading={createMut.isPending} onSubmit={name => createMut.mutate(name)} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>Renommez «{selected?.name}».</DialogDescription>
          </DialogHeader>
          {selected && (
            <CategoryForm
              initialName={selected.name}
              loading={updateMut.isPending}
              onSubmit={name => updateMut.mutate({ id: selected.category_id, name })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer «{deleteTarget?.name}» ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette catégorie sera supprimée définitivement. Les contenus associés ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.category_id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
