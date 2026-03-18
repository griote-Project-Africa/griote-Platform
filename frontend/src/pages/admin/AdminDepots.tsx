import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepots, deleteDepot, approveDepot, rejectDepot, archiveDepot, unarchiveDepot,
} from '@/services/admin.service';
import { createDepot } from '@/services/depot.service';
import { getCategories } from '@/services/category.service';
import type { Depot } from '@/services/admin.service';
import {
  Package, Eye, Trash2, FileText, CheckCircle, XCircle,
  Archive, RotateCcw, Plus, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminPageHeader, AdminStatsCard, AdminEmptyState, StatusBadge,
  ActionButton, GoldButton, SearchInput,
  AdminTable, AdminTableHeader, AdminTableBody, AdminTableRow,
  AdminTableHead, AdminTableCell,
} from '@/components/admin';

function formatSize(bytes: number) {
  if (!bytes) return '—';
  const k = 1024;
  const s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${s[i]}`;
}

type ConfirmType = 'delete' | 'approve' | 'archive' | 'unarchive' | 'reject';
interface ConfirmState { type: ConfirmType; depotId: string; title: string }

const STATUS_TABS = [
  { key: 'all',       label: 'Tous' },
  { key: 'PENDING',   label: 'En attente' },
  { key: 'PUBLISHED', label: 'Publiés' },
  { key: 'DRAFT',     label: 'Brouillons' },
  { key: 'REJECTED',  label: 'Rejetés' },
  { key: 'ARCHIVED',  label: 'Archivés' },
] as const;

export default function AdminDepots() {
  const [search, setSearch]         = useState('');
  const [statusTab, setStatusTab]   = useState<string>('all');
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen]   = useState(false);
  const [confirmState, setConfirmState]   = useState<ConfirmState | null>(null);
  const [rejectReason, setRejectReason]   = useState('');
  const [newTitle, setNewTitle]           = useState('');
  const [newDesc, setNewDesc]             = useState('');
  const [newCat, setNewCat]               = useState('');

  const qc = useQueryClient();

  const { data: depots = [], isLoading } = useQuery<Depot[]>({
    queryKey: ['depots'], queryFn: getDepots,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'], queryFn: getCategories,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['depots'] });

  const deleteMut    = useMutation({ mutationFn: deleteDepot,    onSuccess: () => { invalidate(); toast.success('Dépôt supprimé');    setConfirmState(null); }, onError: () => toast.error('Erreur') });
  const approveMut   = useMutation({ mutationFn: approveDepot,   onSuccess: () => { invalidate(); toast.success('Dépôt publié');      setConfirmState(null); }, onError: () => toast.error('Erreur') });
  const rejectMut    = useMutation({ mutationFn: ({ depotId, reason }: { depotId: string; reason: string }) => rejectDepot(depotId, reason), onSuccess: () => { invalidate(); toast.success('Dépôt rejeté'); setConfirmState(null); setRejectReason(''); }, onError: () => toast.error('Erreur') });
  const archiveMut   = useMutation({ mutationFn: archiveDepot,   onSuccess: () => { invalidate(); toast.success('Dépôt archivé');     setConfirmState(null); }, onError: () => toast.error('Erreur') });
  const unarchiveMut = useMutation({ mutationFn: unarchiveDepot, onSuccess: () => { invalidate(); toast.success('Dépôt désarchivé'); setConfirmState(null); }, onError: () => toast.error('Erreur') });
  const createMut    = useMutation({
    mutationFn: ({ title, description, category_id }: any) =>
      createDepot({ title, description, category_id, status: 'PUBLISHED' }),
    onSuccess: () => {
      invalidate(); toast.success('Dépôt créé');
      setIsCreateOpen(false); setNewTitle(''); setNewDesc(''); setNewCat('');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const isPending = deleteMut.isPending || approveMut.isPending || rejectMut.isPending ||
                    archiveMut.isPending || unarchiveMut.isPending;

  const handleConfirm = () => {
    if (!confirmState) return;
    const { type, depotId } = confirmState;
    if (type === 'delete')     deleteMut.mutate(depotId);
    if (type === 'approve')    approveMut.mutate(depotId);
    if (type === 'archive')    archiveMut.mutate(depotId);
    if (type === 'unarchive')  unarchiveMut.mutate(depotId);
    if (type === 'reject')     rejectMut.mutate({ depotId, reason: rejectReason });
  };

  const filtered = depots.filter(d => {
    const matchStatus = statusTab === 'all' || d.status === statusTab;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const count = (s: string) => s === 'all' ? depots.length : depots.filter(d => d.status === s).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dépôts"
        description="Modération et gestion des dépôts de ressources"
        action={
          <GoldButton icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>
            Créer un dépôt
          </GoldButton>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard title="Total dépôts"   value={depots.length}
          icon={<Package className="h-4 w-4" />}  iconColor="hsl(217 91% 60%)" accentColor="hsl(217 91% 60%)" />
        <AdminStatsCard title="Publiés"        value={count('PUBLISHED')}
          icon={<CheckCircle className="h-4 w-4" />} iconColor="hsl(142 71% 45%)" accentColor="hsl(142 71% 45%)" />
        <AdminStatsCard title="En attente"     value={count('PENDING')}
          icon={<FileText className="h-4 w-4" />}   iconColor="hsl(43 96% 56%)"  accentColor="hsl(43 96% 56%)" />
        <AdminStatsCard title="Total documents"
          value={depots.reduce((t, d) => t + (d.documents?.length || 0), 0)}
          icon={<FileText className="h-4 w-4" />}   iconColor="hsl(258 90% 66%)" accentColor="hsl(258 90% 66%)" />
      </div>

      {/* Status tabs + search */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Status tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-border overflow-x-auto scrollbar-none">
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setStatusTab(t.key)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors"
              style={{
                borderColor: statusTab === t.key ? 'hsl(43 96% 56%)' : 'transparent',
                color: statusTab === t.key ? 'hsl(43 96% 56%)' : 'hsl(var(--muted-foreground))',
              }}
            >
              {t.label}
              <span className="px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-[10px]">
                {count(t.key)}
              </span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-border">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un dépôt…" className="max-w-sm" />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : !filtered.length ? (
          <AdminEmptyState
            title="Aucun dépôt"
            description="Aucun dépôt ne correspond aux critères sélectionnés."
            icon={<Package className="h-6 w-6" />}
          />
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <tr>
                <AdminTableHead>Dépôt</AdminTableHead>
                <AdminTableHead className="hidden md:table-cell">Catégorie</AdminTableHead>
                <AdminTableHead>Statut</AdminTableHead>
                <AdminTableHead className="hidden sm:table-cell">Docs</AdminTableHead>
                <AdminTableHead className="hidden lg:table-cell">Taille</AdminTableHead>
                <AdminTableHead className="hidden md:table-cell">Date</AdminTableHead>
                <AdminTableHead className="text-right">Actions</AdminTableHead>
              </tr>
            </AdminTableHeader>
            <AdminTableBody>
              {filtered.map(depot => (
                <AdminTableRow key={depot.depot_id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      {depot.preview_image ? (
                        <img src={depot.preview_image} alt="" className="w-10 h-7 object-cover rounded border border-border shrink-0" />
                      ) : (
                        <div className="w-10 h-7 rounded border border-border bg-muted/30 shrink-0 flex items-center justify-center">
                          <Package className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-foreground leading-tight">{depot.title}</p>
                        {depot.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">{depot.description}</p>
                        )}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{depot.category?.name ?? '—'}</span>
                  </AdminTableCell>
                  <AdminTableCell><StatusBadge status={depot.status} /></AdminTableCell>
                  <AdminTableCell className="hidden sm:table-cell">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" /> {depot.documents?.length ?? 0}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{formatSize(depot.total_size ?? 0)}</span>
                  </AdminTableCell>
                  <AdminTableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(depot.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {depot.status === 'PENDING' && <>
                        <ActionButton icon={<CheckCircle className="h-3.5 w-3.5" />} title="Publier"  onClick={() => setConfirmState({ type: 'approve',  depotId: depot.depot_id, title: depot.title })} variant="success" />
                        <ActionButton icon={<XCircle    className="h-3.5 w-3.5" />} title="Rejeter"  onClick={() => setConfirmState({ type: 'reject',   depotId: depot.depot_id, title: depot.title })} variant="danger" />
                      </>}
                      {depot.status === 'PUBLISHED' &&
                        <ActionButton icon={<Archive    className="h-3.5 w-3.5" />} title="Archiver"    onClick={() => setConfirmState({ type: 'archive',   depotId: depot.depot_id, title: depot.title })} variant="warning" />}
                      {depot.status === 'ARCHIVED' &&
                        <ActionButton icon={<RotateCcw  className="h-3.5 w-3.5" />} title="Désarchiver" onClick={() => setConfirmState({ type: 'unarchive', depotId: depot.depot_id, title: depot.title })} variant="info" />}
                      <ActionButton icon={<Eye     className="h-3.5 w-3.5" />} title="Détails"    onClick={() => { setSelectedDepot(depot); setIsDetailsOpen(true); }} />
                      <ActionButton icon={<Trash2  className="h-3.5 w-3.5" />} title="Supprimer"  onClick={() => setConfirmState({ type: 'delete', depotId: depot.depot_id, title: depot.title })} variant="danger" />
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </div>

      {/* ── Details dialog ── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du dépôt</DialogTitle>
            <DialogDescription>Informations complètes</DialogDescription>
          </DialogHeader>
          {selectedDepot && (
            <div className="space-y-4">
              {selectedDepot.preview_image && (
                <img src={selectedDepot.preview_image} alt="Preview"
                  className="w-full h-44 object-cover rounded-lg border border-border" />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Titre',          selectedDepot.title],
                  ['Statut',         null],
                  ['Catégorie',      selectedDepot.category?.name ?? '—'],
                  ['Documents',      String(selectedDepot.documents?.length ?? 0)],
                  ['Taille totale',  formatSize(selectedDepot.total_size ?? 0)],
                  ['Vues / DL',      `${selectedDepot.view_count ?? 0} / ${selectedDepot.download_count ?? 0}`],
                ].map(([k, v], i) => (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground mb-0.5">{k}</p>
                    {k === 'Statut'
                      ? <StatusBadge status={selectedDepot.status} />
                      : <p className="font-medium text-foreground">{v}</p>}
                  </div>
                ))}
              </div>
              {selectedDepot.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{selectedDepot.description}</p>
                </div>
              )}
              {selectedDepot.documents && selectedDepot.documents.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Fichiers ({selectedDepot.documents.length})</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedDepot.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg text-sm border border-border">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">{doc.filename}</span>
                          <span className="text-muted-foreground text-xs">({formatSize(doc.file_size ?? 0)})</span>
                        </div>
                        {doc.download_count !== undefined && (
                          <span className="text-xs text-muted-foreground">{doc.download_count} dl</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un dépôt</DialogTitle>
            <DialogDescription>Le dépôt sera directement publié.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titre du dépôt" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select value={newCat} onValueChange={setNewCat}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {(categories as any[]).map(c => (
                    <SelectItem key={c.category_id} value={String(c.category_id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40 text-muted-foreground transition">
              Annuler
            </button>
            <GoldButton
              onClick={() => newTitle && newCat && createMut.mutate({ title: newTitle, description: newDesc, category_id: newCat })}
              disabled={!newTitle || !newCat || createMut.isPending}
            >
              {createMut.isPending ? 'Création…' : 'Créer et publier'}
            </GoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm dialog (non-destructive) ── */}
      {confirmState && confirmState.type !== 'delete' && confirmState.type !== 'reject' && (
        <AlertDialog open onOpenChange={open => !open && setConfirmState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {{ approve: 'Publier', archive: 'Archiver', unarchive: 'Désarchiver' }[confirmState.type]}
                {' «'}{confirmState.title}{'» ?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {{ approve: 'Le dépôt sera visible publiquement.', archive: 'Le dépôt ne sera plus visible publiquement.', unarchive: 'Le dépôt sera remis en statut publié.' }[confirmState.type]}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ── Reject dialog ── */}
      {confirmState?.type === 'reject' && (
        <Dialog open onOpenChange={open => !open && setConfirmState(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Rejeter «{confirmState.title}» ?</DialogTitle>
              <DialogDescription>Le dépôt sera retourné à l'auteur avec une raison.</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label>Raison du rejet <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Expliquez pourquoi…" rows={3} />
            </div>
            <DialogFooter>
              <button onClick={() => { setConfirmState(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/40 transition">
                Annuler
              </button>
              <button onClick={handleConfirm} disabled={rejectMut.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-50">
                {rejectMut.isPending ? 'En cours…' : 'Rejeter'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete confirm ── */}
      {confirmState?.type === 'delete' && (
        <AlertDialog open onOpenChange={open => !open && setConfirmState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer «{confirmState.title}» ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le dépôt et tous ses documents seront définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirm} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
