import { Loader2, User, Package, FileText, Lock, LogOut, Camera, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/auth/useAuth';
import { getProfile, setProfilePicture as uploadProfilePicture } from '@/services/user.service';
import { toast } from 'sonner';
import { AccountForm, SecurityTab, MyDepotsTab, MyArticlesTab } from '@/components/account';

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

function getAvatarColor(seed: string): string {
  const palette = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
  return palette[Math.abs(h) % palette.length];
}

// ── Main component ─────────────────────────────────────────────────────────

const Account: React.FC = () => {
  const { user, logout, refreshUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/connexion');
    return null;
  }

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    navigate('/');
  };

  const handleProfileUpdate = async () => {
    try {
      const fresh = await getProfile();
      localStorage.setItem('user', JSON.stringify(fresh));
      refreshUser();
    } catch { /* ignore */ }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploadingAvatar(true);
    try {
      await uploadProfilePicture(formData);
      await handleProfileUpdate();
      toast.success('Photo de profil mise à jour');
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const avatarColor = getAvatarColor(`${user.first_name}${user.last_name}`);
  const initials    = getInitials(user.first_name, user.last_name);
  const fullName    = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  const isAdmin     = user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Profile hero ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-xl"
                style={{ background: user.profile_picture ? undefined : avatarColor }}
              >
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200
                           shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                title="Changer la photo"
              >
                {uploadingAvatar
                  ? <Upload className="h-3 w-3 text-muted-foreground animate-spin" />
                  : <Camera className="h-3 w-3 text-muted-foreground" />
                }
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{fullName}</h1>
                <span
                  className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={isAdmin
                    ? { background: 'hsl(43 74% 49% / 0.12)', color: 'hsl(43 74% 40%)' }
                    : { background: 'hsl(217 91% 60% / 0.1)', color: 'hsl(217 91% 45%)' }
                  }
                >
                  {isAdmin ? 'Administrateur' : 'Membre'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.email}</p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground
                         hover:text-destructive transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profil" className="space-y-6">

          <TabsList className="h-auto p-0 bg-transparent border-b border-slate-200 rounded-none w-full justify-start gap-0">
            {[
              { value: 'profil',    label: 'Profil',       Icon: User },
              { value: 'depots',   label: 'Mes dépôts',   Icon: Package },
              { value: 'articles', label: 'Mes articles',  Icon: FileText },
              { value: 'securite', label: 'Sécurité',      Icon: Lock },
            ].map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="relative px-4 py-2.5 rounded-none text-sm font-medium text-muted-foreground
                           bg-transparent border-0 shadow-none
                           data-[state=active]:text-primary data-[state=active]:bg-transparent
                           data-[state=active]:shadow-none
                           after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]
                           after:rounded-t after:bg-transparent
                           data-[state=active]:after:bg-primary
                           hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4 mr-1.5 inline-block" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="profil">
            <AccountForm user={user} onProfileUpdate={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="depots">
            <MyDepotsTab />
          </TabsContent>

          <TabsContent value="articles">
            <MyArticlesTab />
          </TabsContent>

          <TabsContent value="securite">
            <SecurityTab onLogout={handleLogout} />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Account;
