import { useState } from 'react';
import {
  getAllUsers, createUser, deleteUser, updateUserRole,
  getTotalUsers, getVerifiedUsers,
} from '../../../services/admin.service';
import type { UserFormData, UsersListResponse } from './types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../../../components/ui/dialog';
import { Users, UserCheck, ShieldCheck, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import UsersTable from './UsersTable';
import UserForm from './UserForm';
import { AdminPageHeader, AdminStatsCard, GoldButton } from '@/components/admin';

export default function AdminUsers() {
  const [page, setPage]               = useState(1);
  const [roleFilter, setRoleFilter]   = useState<'USER' | 'ADMIN' | 'all'>('all');
  const [emailFilter, setEmailFilter] = useState('');
  const [nameFilter, setNameFilter]   = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const qc = useQueryClient();

  // ── Queries ────────────────────────────────────────────────────────
  const { data: usersData, isLoading } = useQuery<UsersListResponse>({
    queryKey: ['users', page, roleFilter, emailFilter, nameFilter],
    queryFn:  () => getAllUsers({ page, limit: 10,
      role:  roleFilter === 'all' ? undefined : roleFilter,
      email: emailFilter || undefined,
      name:  nameFilter  || undefined,
    }),
  });

  const { data: totals } = useQuery({
    queryKey: ['user-totals'],
    queryFn:  async () => {
      const [u, v] = await Promise.all([getTotalUsers(), getVerifiedUsers()]);
      return { total: u.totalUsers, verified: v.verifiedUsers };
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user-totals'] });
      toast.success('Administrateur créé');
      setIsCreateOpen(false);
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['user-totals'] });
      toast.success('Utilisateur supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Rôle mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  // ── Computed ───────────────────────────────────────────────────────
  const verifyRate = totals?.total
    ? Math.round((totals.verified / totals.total) * 100)
    : 0;

  const adminCount = usersData?.users?.filter((u: any) => u.role === 'ADMIN').length ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Utilisateurs"
        description="Gestion des comptes et des rôles"
        action={
          <GoldButton icon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateOpen(true)}>
            Nouveau admin
          </GoldButton>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Total inscrits"
          value={totals?.total ?? '—'}
          icon={<Users className="h-4 w-4" />}
          iconColor="hsl(217 91% 60%)"
          accentColor="hsl(217 91% 60%)"
        />
        <AdminStatsCard
          title="Comptes vérifiés"
          value={totals?.verified ?? '—'}
          description={`${verifyRate}% de vérification`}
          icon={<UserCheck className="h-4 w-4" />}
          iconColor="hsl(142 71% 45%)"
          accentColor="hsl(142 71% 45%)"
        />
        <AdminStatsCard
          title="Administrateurs"
          value={adminCount}
          description="Comptes admin actifs"
          icon={<ShieldCheck className="h-4 w-4" />}
          iconColor="hsl(43 96% 56%)"
          accentColor="hsl(43 96% 56%)"
        />
        <AdminStatsCard
          title="Filtrés"
          value={usersData?.totalUsers ?? '—'}
          description="Résultats actuels"
          icon={<Users className="h-4 w-4" />}
          iconColor="hsl(258 90% 66%)"
          accentColor="hsl(258 90% 66%)"
        />
      </div>

      {/* Table block */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Liste des utilisateurs</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {usersData?.totalUsers ?? 0} compte{usersData?.totalUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="p-6">
          <UsersTable
            data={usersData}
            isLoading={isLoading}
            page={page}
            totalPages={usersData?.totalPages ?? 1}
            roleFilter={roleFilter}
            emailFilter={emailFilter}
            nameFilter={nameFilter}
            onPageChange={setPage}
            onRoleFilterChange={setRoleFilter}
            onEmailFilterChange={setEmailFilter}
            onNameFilterChange={setNameFilter}
            onDelete={(id) => deleteMutation.mutate(id)}
            onRoleChange={(id, role) => roleMutation.mutate({ userId: id, role })}
          />
        </div>
      </div>

      {/* Create admin dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un administrateur</DialogTitle>
            <DialogDescription>
              Ajouter un nouveau compte avec les droits d'administration.
            </DialogDescription>
          </DialogHeader>
          <UserForm loading={createMutation.isPending} onSubmit={createMutation.mutate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
