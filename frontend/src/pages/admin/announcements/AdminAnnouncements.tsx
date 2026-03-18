import { useState } from 'react';
import {
  getAllAnnouncementsForAdmin, createAnnouncement, updateAnnouncement,
  deleteAnnouncement, publishAnnouncement, archiveAnnouncement,
} from '../../../services/announcement.service';
import type { Announcement } from '../../../types/announcement';
import type { AnnouncementFormData } from './types';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../../../components/ui/dialog';
import { Plus, Megaphone, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AnnouncementsTable from './AnnouncementsTable';
import AnnouncementForm from './AnnouncementForm';
import type { AnnouncementStatus } from '../../../types/announcement';
import {
  AdminPageHeader, AdminStatsCard, GoldButton, SearchInput,
} from '@/components/admin';

export default function AdminAnnouncements() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AnnouncementStatus>('all');
  const [openCreate, setOpenCreate]   = useState(false);
  const [openEdit, setOpenEdit]       = useState(false);
  const [selected, setSelected]       = useState<Announcement | null>(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: getAllAnnouncementsForAdmin,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['announcements'] });

  const createMut = useMutation({
    mutationFn: (fd: AnnouncementFormData) => createAnnouncement(fd),
    onSuccess: () => { toast.success('Annonce créée'); invalidate(); setOpenCreate(false); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Erreur lors de la création'),
  });

  const updateMut = useMutation({
    mutationFn: (p: { id: number } & AnnouncementFormData) => updateAnnouncement(p.id, p),
    onSuccess: () => { toast.success('Annonce mise à jour'); invalidate(); setOpenEdit(false); },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Erreur lors de la mise à jour'),
  });

  const publishMut = useMutation({ mutationFn: publishAnnouncement,  onSuccess: invalidate });
  const archiveMut = useMutation({ mutationFn: archiveAnnouncement,  onSuccess: invalidate });
  const deleteMut  = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => { toast.success('Annonce supprimée'); invalidate(); },
  });

  const announcements = (data ?? []).filter(a =>
    (statusFilter === 'all' || a.status === statusFilter) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  const count = (s: string) => (data ?? []).filter(a => a.status === s).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Annonces"
        description="Communiqués et informations à destination des utilisateurs"
        action={
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <GoldButton icon={<Plus className="h-4 w-4" />}>Nouvelle annonce</GoldButton>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvelle annonce</DialogTitle>
                <DialogDescription>Rédigez et configurez votre annonce.</DialogDescription>
              </DialogHeader>
              <AnnouncementForm loading={createMut.isPending} onSubmit={createMut.mutate} onCancel={() => setOpenCreate(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatsCard title="Publiées"   value={count('PUBLISHED')}
          icon={<Megaphone className="h-4 w-4" />} iconColor="hsl(142 71% 45%)" accentColor="hsl(142 71% 45%)" />
        <AdminStatsCard title="Brouillons" value={count('DRAFT')}
          icon={<Megaphone className="h-4 w-4" />} iconColor="hsl(43 96% 56%)"  accentColor="hsl(43 96% 56%)" />
        <AdminStatsCard title="Archivées"  value={count('ARCHIVED')}
          icon={<Megaphone className="h-4 w-4" />} iconColor="hsl(215 20% 60%)" accentColor="hsl(215 20% 60%)" />
      </div>

      {/* List card */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher une annonce…"
            className="flex-1 min-w-48"
          />
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as 'all' | AnnouncementStatus)}>
            <SelectTrigger className="w-36 h-9 text-sm bg-background border-border">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillons</SelectItem>
              <SelectItem value="PUBLISHED">Publiées</SelectItem>
              <SelectItem value="ARCHIVED">Archivées</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground shrink-0">
            {announcements.length} résultat{announcements.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 py-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <AnnouncementsTable
              data={announcements}
              isLoading={isLoading}
              onPublish={id => publishMut.mutate(id)}
              onArchive={id => archiveMut.mutate(id)}
              onDelete={id => deleteMut.mutate(id)}
              onEdit={a => { setSelected(a); setOpenEdit(true); }}
            />
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'annonce</DialogTitle>
            <DialogDescription>Mettez à jour le contenu et les paramètres.</DialogDescription>
          </DialogHeader>
          {selected && (
            <AnnouncementForm
              initialValues={{
                title: selected.title,
                content: selected.content,
                cover_image_url: selected.cover_image_url,
                is_featured: selected.is_featured,
              }}
              loading={updateMut.isPending}
              onSubmit={data => updateMut.mutate({ id: selected.announcement_id, ...data })}
              onCancel={() => setOpenEdit(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
