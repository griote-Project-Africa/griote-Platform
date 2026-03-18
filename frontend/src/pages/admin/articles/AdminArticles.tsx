import { useState } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Archive, FileText, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ArticleForm from './ArticleForm';
import {
  getArticles, approveArticle, rejectArticle, archiveArticle, deleteArticle,
} from '../../../services/article.service';
import type { Article, ArticleStatus } from '../../../types/article';
import {
  AdminPageHeader, AdminEmptyState, StatusBadge,
  ActionButton, GoldButton,
  AdminTable, AdminTableHeader, AdminTableBody, AdminTableRow,
  AdminTableHead, AdminTableCell,
} from '@/components/admin';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type StatusFilter = 'all' | ArticleStatus;

const STATUS_TABS = [
  { key: 'all',       label: 'Tous' },
  { key: 'PENDING',   label: 'En attente' },
  { key: 'PUBLISHED', label: 'Publiés' },
  { key: 'DRAFT',     label: 'Brouillons' },
  { key: 'REJECTED',  label: 'Rejetés' },
  { key: 'ARCHIVED',  label: 'Archivés' },
] as const;

export default function AdminArticles() {
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isFormOpen, setIsFormOpen]     = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const qc = useQueryClient();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: () => getArticles(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['articles'] });

  const approveMut = useMutation({
    mutationFn: approveArticle,
    onSuccess: () => { invalidate(); toast.success('Article approuvé'); },
    onError: () => toast.error("Impossible d'approuver l'article"),
  });

  const rejectMut = useMutation({
    mutationFn: (id: number) => rejectArticle(id),
    onSuccess: () => { invalidate(); toast.success('Article rejeté'); },
    onError: () => toast.error("Impossible de rejeter l'article"),
  });

  const archiveMut = useMutation({
    mutationFn: archiveArticle,
    onSuccess: () => { invalidate(); toast.success('Article archivé'); },
    onError: () => toast.error("Impossible d'archiver l'article"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => { invalidate(); toast.success('Article supprimé'); setDeleteTarget(null); },
    onError: () => toast.error("Impossible de supprimer l'article"),
  });

  const filtered = articles.filter(a => {
    const matchSearch =
      !searchTerm.trim() ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.author?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.author?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && (statusFilter === 'all' || a.status === statusFilter);
  });

  const count = (s: string) => s === 'all' ? articles.length : articles.filter(a => a.status === s).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Articles"
        description="Modération et publication du contenu éditorial"
        action={
          <GoldButton
            icon={<Plus className="h-4 w-4" />}
            onClick={() => { setSelectedArticle(undefined); setIsFormOpen(true); }}
          >
            Rédiger un article
          </GoldButton>
        }
      />

      {/* Table block */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Status tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-border overflow-x-auto scrollbar-none">
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key as StatusFilter)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors"
              style={{
                borderColor: statusFilter === t.key ? 'hsl(43 96% 56%)' : 'transparent',
                color: statusFilter === t.key ? 'hsl(43 96% 56%)' : 'hsl(var(--muted-foreground))',
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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Titre, auteur, catégorie…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : !filtered.length ? (
          <AdminEmptyState
            title="Aucun article"
            description="Aucun article ne correspond aux critères."
            icon={<FileText className="h-6 w-6" />}
          />
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <tr>
                <AdminTableHead>Article</AdminTableHead>
                <AdminTableHead className="hidden md:table-cell">Auteur</AdminTableHead>
                <AdminTableHead className="hidden lg:table-cell">Catégorie</AdminTableHead>
                <AdminTableHead>Statut</AdminTableHead>
                <AdminTableHead className="hidden sm:table-cell">Date</AdminTableHead>
                <AdminTableHead className="text-right">Actions</AdminTableHead>
              </tr>
            </AdminTableHeader>
            <AdminTableBody>
              {filtered.map(article => (
                <AdminTableRow key={article.article_id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      {(article as any).cover_image_url ? (
                        <img
                          src={(article as any).cover_image_url}
                          alt=""
                          className="w-10 h-7 rounded border border-border object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-7 rounded border border-border bg-muted/30 flex items-center justify-center shrink-0">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-foreground leading-tight">{article.title}</p>
                        {article.subtitle && (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{article.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {article.author?.first_name} {article.author?.last_name}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">{article.category?.name ?? '—'}</span>
                  </AdminTableCell>
                  <AdminTableCell><StatusBadge status={article.status} /></AdminTableCell>
                  <AdminTableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {article.status === 'PENDING' && <>
                        <ActionButton icon={<CheckCircle className="h-3.5 w-3.5" />} title="Approuver" onClick={() => approveMut.mutate(article.article_id)} variant="success" />
                        <ActionButton icon={<XCircle    className="h-3.5 w-3.5" />} title="Rejeter"   onClick={() => rejectMut.mutate(article.article_id)}  variant="danger" />
                      </>}
                      {article.status === 'PUBLISHED' &&
                        <ActionButton icon={<Archive className="h-3.5 w-3.5" />} title="Archiver" onClick={() => archiveMut.mutate(article.article_id)} variant="warning" />}
                      <ActionButton
                        icon={<Edit   className="h-3.5 w-3.5" />}
                        title="Modifier"
                        onClick={() => { setSelectedArticle(article); setIsFormOpen(true); }}
                      />
                      <ActionButton
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        title="Supprimer"
                        onClick={() => setDeleteTarget(article)}
                        variant="danger"
                      />
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </div>

      {/* Article form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle ? "Modifier l'article" : 'Rédiger un article'}</DialogTitle>
            <DialogDescription>
              {selectedArticle ? "Modifiez les informations de l'article." : 'Remplissez le formulaire pour créer un article.'}
            </DialogDescription>
          </DialogHeader>
          <ArticleForm
            article={selectedArticle}
            onSuccess={() => { setIsFormOpen(false); invalidate(); }}
            onCancel={() => { setIsFormOpen(false); setSelectedArticle(undefined); }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer «{deleteTarget?.title}» ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cet article sera définitivement supprimé et ne pourra pas être récupéré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.article_id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
