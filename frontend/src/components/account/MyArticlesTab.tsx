import { useState } from 'react';
import {
  FileText, Plus, Trash2, Send, Pencil, BookOpen, Loader2,
  Clock, CheckCircle, XCircle, Archive, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMyArticles, deleteArticle, submitArticle } from '@/services/article.service';
import type { Article } from '@/types/article';
import ArticleForm from '@/pages/admin/articles/ArticleForm';

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  DRAFT:     { label: 'Brouillon',   icon: FileText,     className: 'bg-slate-100 text-slate-600' },
  PENDING:   { label: 'En attente',  icon: Clock,        className: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED: { label: 'Publié',      icon: CheckCircle,  className: 'bg-green-100 text-green-700' },
  REJECTED:  { label: 'Rejeté',      icon: XCircle,      className: 'bg-red-100 text-red-700' },
  ARCHIVED:  { label: 'Archivé',     icon: Archive,      className: 'bg-gray-100 text-gray-500' },
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

// ── Component ──────────────────────────────────────────────────────────────

export function MyArticlesTab() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [submitTarget, setSubmitTarget] = useState<Article | null>(null);

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['my-articles'],
    queryFn: getMyArticles,
    retry: 1,
  });

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-articles'] });
      toast.success('Article supprimé');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const submitMutation = useMutation<Article, Error, number>({
    mutationFn: submitArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-articles'] });
      toast.success('Article soumis pour validation');
      setSubmitTarget(null);
    },
    onError: () => toast.error('Erreur lors de la soumission'),
  });

  const openCreate = () => {
    setEditingArticle(undefined);
    setViewMode('form');
  };

  const openEdit = (article: Article) => {
    setEditingArticle(article);
    setViewMode('form');
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['my-articles'] });
    setViewMode('list');
    setEditingArticle(undefined);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setEditingArticle(undefined);
  };

  const canEdit   = (status: string) => status === 'DRAFT' || status === 'REJECTED';
  const canSubmit = (status: string) => status === 'DRAFT' || status === 'REJECTED';

  // ── Form view ─────────────────────────────────────────────────────────────

  if (viewMode === 'form') {
    return (
      <div className="space-y-4">
        <ArticleForm
          article={editingArticle}
          canPublish={false}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes articles</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Rédigez et soumettez vos articles à l'équipe éditoriale
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Rédiger un article
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-sm text-primary">
        <BookOpen className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Vos articles sont examinés par l'équipe Griote avant publication.
          Soumettez votre brouillon quand il est prêt.
        </span>
      </div>

      {/* Empty state */}
      {articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Aucun article pour l'instant
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Partagez vos connaissances avec la communauté en rédigeant votre premier article.
          </p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Rédiger mon premier article
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Card key={article.article_id} className="flex flex-col border-border hover:shadow-md transition-shadow">
              {article.cover_image_url && (
                <div className="h-36 overflow-hidden rounded-t-xl">
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <StatusBadge status={article.status} />
                </div>

                {article.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {article.category && (
                    <span className="bg-muted px-2 py-0.5 rounded-full font-medium">
                      {article.category.name}
                    </span>
                  )}
                  {article.read_time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.read_time_minutes} min
                    </span>
                  )}
                </div>

                {/* Rejection reason */}
                {article.status === 'REJECTED' && article.rejection_reason && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    Raison : {article.rejection_reason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2 flex-wrap">
                {article.status === 'PUBLISHED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => window.open(`/articles/${article.article_id}`, '_blank')}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Voir
                  </Button>
                )}

                {canEdit(article.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8"
                    onClick={() => openEdit(article)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Modifier
                  </Button>
                )}

                {canSubmit(article.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 text-primary border-primary/30 hover:bg-primary/5"
                    onClick={() => setSubmitTarget(article)}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Soumettre
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => setDeleteTarget(article)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'article <strong>{deleteTarget?.title}</strong> sera définitivement supprimé.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.article_id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit confirmation */}
      <AlertDialog open={!!submitTarget} onOpenChange={(v) => !v && setSubmitTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soumettre pour validation ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'article <strong>{submitTarget?.title}</strong> sera soumis à l'équipe éditoriale Griote.
              Vous ne pourrez plus le modifier tant qu'il sera en attente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitTarget && submitMutation.mutate(submitTarget.article_id)}
            >
              Soumettre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
