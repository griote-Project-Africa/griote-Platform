import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, ShieldCheck, Trash2 } from 'lucide-react';
import type { UsersListResponse } from '../../../services/admin.service';
import {
  AdminTable, AdminTableHeader, AdminTableBody, AdminTableRow, AdminTableHead, AdminTableCell,
  AdminEmptyState, ActionButton, SearchInput, UserAvatar,
} from '@/components/admin';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminUser {
  user_id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  email_verified: boolean;
  created_at: string;
}

interface Props {
  data: UsersListResponse | undefined;
  isLoading: boolean;
  page: number;
  totalPages: number;
  roleFilter: 'USER' | 'ADMIN' | 'all';
  emailFilter: string;
  nameFilter: string;
  onPageChange: (page: number) => void;
  onRoleFilterChange: (role: 'USER' | 'ADMIN' | 'all') => void;
  onEmailFilterChange: (email: string) => void;
  onNameFilterChange: (name: string) => void;
  onDelete: (userId: string) => void;
  onRoleChange: (userId: string, role: 'USER' | 'ADMIN') => void;
}

export default function UsersTable({
  data, isLoading, page, totalPages,
  roleFilter, emailFilter, nameFilter,
  onPageChange, onRoleFilterChange, onEmailFilterChange, onNameFilterChange,
  onDelete, onRoleChange,
}: Props) {
  const users = data?.users as unknown as AdminUser[] | undefined;
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={emailFilter}
          onChange={onEmailFilterChange}
          placeholder="Filtrer par email…"
          className="flex-1 min-w-48"
        />
        <SearchInput
          value={nameFilter}
          onChange={onNameFilterChange}
          placeholder="Filtrer par nom…"
          className="flex-1 min-w-48"
        />
        <Select value={roleFilter} onValueChange={v => onRoleFilterChange(v as 'USER' | 'ADMIN' | 'all')}>
          <SelectTrigger className="w-36 text-sm h-9 bg-background border-border">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="USER">Utilisateur</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminTable>
        <AdminTableHeader>
          <tr>
            <AdminTableHead>Utilisateur</AdminTableHead>
            <AdminTableHead className="hidden md:table-cell">Email</AdminTableHead>
            <AdminTableHead>Rôle</AdminTableHead>
            <AdminTableHead className="hidden sm:table-cell">Email vérifié</AdminTableHead>
            <AdminTableHead className="hidden lg:table-cell">Inscription</AdminTableHead>
            <AdminTableHead className="text-right">Actions</AdminTableHead>
          </tr>
        </AdminTableHeader>
        <AdminTableBody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                Chargement…
              </td>
            </tr>
          ) : !users?.length ? (
            <tr>
              <td colSpan={6}>
                <AdminEmptyState title="Aucun utilisateur trouvé" description="Essayez d'ajuster vos filtres." />
              </td>
            </tr>
          ) : (
            users.map(user => (
              <AdminTableRow key={user.user_id}>
                {/* Name + avatar */}
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar firstName={user.first_name} lastName={user.last_name} size={8} />
                    <div>
                      <p className="font-medium text-foreground text-sm leading-tight">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">#{String(user.user_id).slice(0, 8)}</p>
                    </div>
                  </div>
                </AdminTableCell>

                {/* Email */}
                <AdminTableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground font-mono">{user.email}</span>
                </AdminTableCell>

                {/* Role badge */}
                <AdminTableCell>
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                      <Shield className="h-3 w-3" /> Utilisateur
                    </span>
                  )}
                </AdminTableCell>

                {/* Verified */}
                <AdminTableCell className="hidden sm:table-cell">
                  {user.email_verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                      Vérifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
                      Non vérifié
                    </span>
                  )}
                </AdminTableCell>

                {/* Date */}
                <AdminTableCell className="hidden lg:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </AdminTableCell>

                {/* Actions */}
                <AdminTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {user.role === 'USER' ? (
                      <ActionButton
                        icon={<Shield className="h-3.5 w-3.5" />}
                        title="Promouvoir admin"
                        onClick={() => onRoleChange(user.user_id, 'ADMIN')}
                        variant="warning"
                      />
                    ) : (
                      <ActionButton
                        icon={<ShieldCheck className="h-3.5 w-3.5" />}
                        title="Rétrograder utilisateur"
                        onClick={() => onRoleChange(user.user_id, 'USER')}
                        variant="info"
                      />
                    )}
                    <ActionButton
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      title="Supprimer"
                      onClick={() => setDeleteTarget(user)}
                      variant="danger"
                    />
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))
          )}
        </AdminTableBody>
      </AdminTable>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Page {page} / {totalPages} · {data?.totalUsers ?? 0} utilisateurs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Précédent
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le compte de{' '}
              <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => { if (deleteTarget) { onDelete(deleteTarget.user_id); setDeleteTarget(null); } }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
