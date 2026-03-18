import { useState } from 'react';
import {
  FileText, Plus, Eye, Trash2, Send, Pencil, FolderOpen, Loader2, Clock,
  CheckCircle, XCircle, Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMyDepots, deleteDepot, submitDepotForReview } from '@/services/depot.service';
import type { Depot } from '@/services/admin.service';
import { DepotFormDialog } from './DepotFormDialog';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  DRAFT: {
    label: 'Brouillon',
    icon: FileText,
    className: 'bg-slate-100 text-slate-600',
  },
  PENDING: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700',
  },
  PUBLISHED: {
    label: 'Publié',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700',
  },
  REJECTED: {
    label: 'Rejeté',
    icon: XCircle,
    className: 'bg-red-100 text-red-700',
  },
  ARCHIVED: {
    label: 'Archivé',
    icon: Archive,
    className: 'bg-gray-100 text-gray-500',
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function MyDepotsTab() {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | undefined>(undefined);

  const [detailsDepot, setDetailsDepot] = useState<Depot | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Depot | null>(null);
  const [submitTarget, setSubmitTarget] = useState<Depot | null>(null);

  const { data: depots = [], isLoading } = useQuery<Depot[]>({
    queryKey: ['my-depots'],
    queryFn: getMyDepots,
    retry: 1,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteDepot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-depots'] });
      toast.success('Dépôt supprimé');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const submitMutation = useMutation<Depot, Error, string>({
    mutationFn: submitDepotForReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-depots'] });
      toast.success('Dépôt soumis pour validation');
      setSubmitTarget(null);
    },
    onError: () => toast.error('Erreur lors de la soumission'),
  });

  const openCreate = () => {
    setEditingDepot(undefined);
    setFormOpen(true);
  };

  const openEdit = (depot: Depot) => {
    setEditingDepot(depot);
    setFormOpen(true);
  };

  const canEdit = (status: string) => status === 'DRAFT' || status === 'REJECTED';
  const canSubmit = (status: string) => status === 'DRAFT' || status === 'REJECTED';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes dépôts</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gérez vos collections de documents
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un dépôt
        </Button>
      </div>

      {/* Empty state */}
      {depots.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Aucun dépôt pour l'instant
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Créez votre premier dépôt pour partager vos connaissances avec la communauté panafricaine.
          </p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Créer mon premier dépôt
          </Button>
        </div>
      ) : (
        /* Depot cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {depots.map((depot) => (
            <Card key={depot.depot_id} className="flex flex-col border-border hover:shadow-md transition-shadow">
              {depot.preview_image && (
                <div className="h-36 overflow-hidden rounded-t-xl">
                  <img
                    src={depot.preview_image}
                    alt={depot.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                    {depot.title}
                  </h3>
                  <StatusBadge status={depot.status} />
                </div>

                {depot.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {depot.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {depot.category && (
                    <span className="bg-muted px-2 py-0.5 rounded-full font-medium">
                      {depot.category.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {depot.documents?.length || 0} doc{(depot.documents?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  {depot.total_size ? (
                    <span>{formatFileSize(depot.total_size)}</span>
                  ) : null}
                </div>

                {/* Rejection reason */}
                {depot.status === 'REJECTED' && (depot as any).rejection_reason && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    Raison : {(depot as any).rejection_reason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs h-8"
                  onClick={() => { setDetailsDepot(depot); setDetailsOpen(true); }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Voir
                </Button>

                {canEdit(depot.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => openEdit(depot)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Modifier
                  </Button>
                )}

                {canSubmit(depot.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 text-primary border-primary/30 hover:bg-primary/5"
                    onClick={() => setSubmitTarget(depot)}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Soumettre
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => setDeleteTarget(depot)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Depot form dialog (create / edit) */}
      <DepotFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDepot(undefined); }}
        depot={editingDepot}
      />

      {/* Details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du dépôt</DialogTitle>
            <DialogDescription>Informations complètes</DialogDescription>
          </DialogHeader>
          {detailsDepot && (
            <div className="space-y-3 text-sm">
              {detailsDepot.preview_image && (
                <img
                  src={detailsDepot.preview_image}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
              )}
              <p><span className="font-medium">Titre :</span> {detailsDepot.title}</p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Statut :</span>
                <StatusBadge status={detailsDepot.status} />
              </p>
              <p><span className="font-medium">Catégorie :</span> {detailsDepot.category?.name || '—'}</p>
              {detailsDepot.description && (
                <p><span className="font-medium">Description :</span> {detailsDepot.description}</p>
              )}
              {detailsDepot.tags && detailsDepot.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="font-medium mr-1">Tags :</span>
                  {detailsDepot.tags.map((t: any, i: number) => (
                    <span key={i} className="bg-muted text-foreground/70 px-2 py-0.5 rounded-full text-xs">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <p>
                <span className="font-medium">Documents :</span>{' '}
                {detailsDepot.documents?.length || 0}
              </p>
              {detailsDepot.total_size ? (
                <p><span className="font-medium">Taille totale :</span> {formatFileSize(detailsDepot.total_size)}</p>
              ) : null}
              <p><span className="font-medium">Vues :</span> {detailsDepot.view_count || 0}</p>
              <p><span className="font-medium">Téléchargements :</span> {detailsDepot.download_count || 0}</p>
              <p>
                <span className="font-medium">Créé le :</span>{' '}
                {new Date(detailsDepot.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>

              {detailsDepot.documents && detailsDepot.documents.length > 0 && (
                <div>
                  <p className="font-medium mb-1.5">Liste des documents :</p>
                  <div className="space-y-1.5">
                    {detailsDepot.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate text-sm">{doc.filename}</span>
                        {doc.file_size && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatFileSize(doc.file_size)}
                          </span>
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dépôt ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dépôt <strong>{deleteTarget?.title}</strong> et tous ses documents seront définitivement supprimés.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.depot_id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit for review confirmation */}
      <AlertDialog open={!!submitTarget} onOpenChange={(v) => !v && setSubmitTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soumettre pour validation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dépôt <strong>{submitTarget?.title}</strong> sera soumis à l'équipe Griote pour examen.
              Vous ne pourrez plus le modifier tant qu'il sera en attente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitTarget && submitMutation.mutate(submitTarget.depot_id)}
            >
              Soumettre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
