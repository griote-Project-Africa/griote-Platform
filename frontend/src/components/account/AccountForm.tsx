import { useState, useRef } from 'react';
import {
  Calendar, FileText, Globe, Link2,
  Save, Camera, Upload, MapPin, ChevronsUpDown, Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { toast } from 'sonner';
import { updateProfile, setProfilePicture as uploadProfilePicture } from '@/services/user.service';
import type { User } from '@/services/auth.service';
import { COUNTRIES, AFRICAN_COUNTRY_CODES } from '@/lib/countries';

const AFRICAN_COUNTRIES = COUNTRIES.filter(c => AFRICAN_COUNTRY_CODES.has(c.code));
const OTHER_COUNTRIES   = COUNTRIES.filter(c => !AFRICAN_COUNTRY_CODES.has(c.code));

interface AccountFormProps {
  user: User | null;
  onProfileUpdate: () => void;
}

interface ProfileState {
  firstName: string;
  lastName: string;
  bio: string;
  dateOfBirth: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  country: string;
}

export function AccountForm({ user, onProfileUpdate }: AccountFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileState>({
    firstName:   user?.first_name   || '',
    lastName:    user?.last_name    || '',
    bio:         user?.bio          || '',
    dateOfBirth: user?.date_of_birth || '',
    linkedinUrl: user?.linkedin_url  || '',
    githubUrl:   user?.github_url    || '',
    websiteUrl:  user?.website_url   || '',
    country:     user?.country       || '',
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profile_picture || null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [loading, setLoading] = useState({ profile: false, upload: false });

  const set = (key: keyof ProfileState, value: string) =>
    setProfile(prev => ({ ...prev, [key]: value }));

  const selectedCountry = COUNTRIES.find(c => c.code === profile.country);

  const handleSelectPicture = () => fileInputRef.current?.click();

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicture(null);
    const formData = new FormData();
    formData.append('image', file);
    setLoading(prev => ({ ...prev, upload: true }));
    try {
      const updatedUser = await uploadProfilePicture(formData);
      if (updatedUser?.profile_picture) setProfilePicture(updatedUser.profile_picture);
      onProfileUpdate();
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload de la photo");
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    const data: Record<string, any> = {};
    if (profile.firstName.trim())   data.first_name   = profile.firstName;
    if (profile.lastName.trim())    data.last_name    = profile.lastName;
    if (profile.bio.trim())         data.bio          = profile.bio;
    if (profile.dateOfBirth.trim()) data.date_of_birth = profile.dateOfBirth;
    if (profile.linkedinUrl.trim()) data.linkedin_url  = profile.linkedinUrl;
    if (profile.githubUrl.trim())   data.github_url    = profile.githubUrl;
    if (profile.websiteUrl.trim())  data.website_url   = profile.websiteUrl;
    // country: send even if empty to allow clearing
    data.country = profile.country || null;

    try {
      await updateProfile(data);
      onProfileUpdate();
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* Photo de profil */}
      <div className="flex items-center gap-5 p-4 rounded-xl bg-muted/20 border border-border">
        <div className="relative shrink-0">
          <div className="w-18 h-18 bg-muted rounded-full overflow-hidden border-2 border-border flex items-center justify-center" style={{ width: 72, height: 72 }}>
            {profilePicture ? (
              <img src={profilePicture} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSelectPicture}
            disabled={loading.upload}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 hover:bg-amber-400 text-black rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {loading.upload ? <Upload className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadPicture} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          <button
            type="button"
            onClick={handleSelectPicture}
            disabled={loading.upload}
            className="mt-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
          >
            Changer la photo
          </button>
        </div>
      </div>

      {/* Identité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
          <Input
            id="firstName" value={profile.firstName}
            onChange={e => set('firstName', e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
          <Input
            id="lastName" value={profile.lastName}
            onChange={e => set('lastName', e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Pays */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Pays</Label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                {selectedCountry
                  ? <span>{selectedCountry.flag} {selectedCountry.name}</span>
                  : <span className="text-muted-foreground">Sélectionner un pays…</span>
                }
              </span>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un pays…" className="h-9" />
              <CommandList className="max-h-60">
                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                <CommandGroup heading="Afrique">
                  {AFRICAN_COUNTRIES.map(c => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      onSelect={() => { set('country', c.code); setCountryOpen(false); }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      {profile.country === c.code && <Check className="h-4 w-4 text-amber-400" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Reste du monde">
                  {OTHER_COUNTRIES.map(c => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      onSelect={() => { set('country', c.code); setCountryOpen(false); }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      {profile.country === c.code && <Check className="h-4 w-4 text-amber-400" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Date de naissance */}
      <div className="space-y-1.5">
        <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Date de naissance
        </Label>
        <Input
          id="dateOfBirth" type="date"
          value={profile.dateOfBirth}
          onChange={e => set('dateOfBirth', e.target.value)}
          className="h-10"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Bio
        </Label>
        <Textarea
          id="bio" rows={3}
          value={profile.bio}
          onChange={e => set('bio', e.target.value)}
          placeholder="Décrivez-vous en quelques mots…"
          className="resize-none"
        />
      </div>

      <Separator />

      {/* Liens */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Liens</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="linkedin" className="text-xs text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3" /> LinkedIn
            </Label>
            <Input id="linkedin" type="url" value={profile.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} className="h-9 text-sm" placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="github" className="text-xs text-muted-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3" /> GitHub
            </Label>
            <Input id="github" type="url" value={profile.githubUrl} onChange={e => set('githubUrl', e.target.value)} className="h-9 text-sm" placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> Site web
            </Label>
            <Input id="website" type="url" value={profile.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} className="h-9 text-sm" placeholder="https://…" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading.profile}
        className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Save className="h-4 w-4" />
        {loading.profile ? 'Enregistrement…' : 'Enregistrer les modifications'}
      </button>
    </form>
  );
}
