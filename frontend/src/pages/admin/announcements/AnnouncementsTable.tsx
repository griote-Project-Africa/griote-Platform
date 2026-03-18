import type { Announcement } from '../../../types/announcement';
import { Edit, Trash2, RefreshCw, CheckCircle, Archive, Image as ImageIcon } from 'lucide-react';
import { StatusBadge, ActionButton } from '@/components/admin';

interface Props {
  data: Announcement[];
  isLoading: boolean;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
  onEdit: (a: Announcement) => void;
  onDelete: (id: number) => void;
}

export default function AnnouncementsTable({ data, onPublish, onArchive, onEdit, onDelete }: Props) {
  if (!data.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-full bg-muted/30 border border-border flex items-center justify-center mb-4 text-muted-foreground">
        <ImageIcon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">Aucune annonce</p>
      <p className="text-xs text-muted-foreground mt-1">Créez votre première annonce pour commencer.</p>
    </div>
  );

  return (
    <div className="divide-y divide-border/60">
      {data.map(a => (
        <div key={a.announcement_id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 hover:bg-muted/10 transition-colors px-1 rounded-lg group">
          {/* Top row: thumbnail + content + actions (sm+) */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Thumbnail */}
            <div className="shrink-0 w-16 h-11 rounded-lg overflow-hidden border border-border bg-muted/20">
              {a.cover_image_url
                ? <img src={a.cover_image_url} alt={a.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
              }
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm text-foreground truncate max-w-xs">{a.title}</p>
                {a.is_featured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 font-semibold">
                    À la une
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <StatusBadge status={a.status} />
                <span className="text-[11px] text-muted-foreground">
                  Créée {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </span>
                {a.published_at && (
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    · Publiée {new Date(a.published_at).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions — always visible on mobile, hover on desktop */}
          <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
            {a.status === 'DRAFT' &&
              <ActionButton icon={<CheckCircle className="h-3.5 w-3.5" />} title="Publier"    onClick={() => onPublish(a.announcement_id)} variant="success" />}
            {a.status === 'PUBLISHED' &&
              <ActionButton icon={<Archive     className="h-3.5 w-3.5" />} title="Archiver"   onClick={() => onArchive(a.announcement_id)} variant="warning" />}
            {a.status === 'ARCHIVED' &&
              <ActionButton icon={<RefreshCw   className="h-3.5 w-3.5" />} title="Republier"  onClick={() => onPublish(a.announcement_id)} variant="info" />}
            <ActionButton icon={<Edit    className="h-3.5 w-3.5" />} title="Modifier"   onClick={() => onEdit(a)} />
            <ActionButton icon={<Trash2  className="h-3.5 w-3.5" />} title="Supprimer"  onClick={() => onDelete(a.announcement_id)} variant="danger" />
          </div>
        </div>
      ))}
    </div>
  );
}
