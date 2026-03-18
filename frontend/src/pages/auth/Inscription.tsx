import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, AlertCircle,
  CheckCircle, Loader2, ArrowRight, MapPin, ChevronsUpDown, Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useAuth } from '@/auth/useAuth';
import { toast } from 'sonner';
import grioteLogo from '@/assets/griote.svg';
import { COUNTRIES, AFRICAN_COUNTRY_CODES } from '@/lib/countries';

const AFRICAN_COUNTRIES = COUNTRIES.filter(c => AFRICAN_COUNTRY_CODES.has(c.code));
const OTHER_COUNTRIES   = COUNTRIES.filter(c => !AFRICAN_COUNTRY_CODES.has(c.code));

export default function Inscription() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', country: '',
  });
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryOpen, setCountryOpen]               = useState(false);
  const [isLoading, setIsLoading]                   = useState(false);
  const [error, setError]                           = useState('');
  const [success, setSuccess]                       = useState(false);
  const { register } = useAuth();

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        country: formData.country || undefined,
        role: 'USER',
      });
      setSuccess(true);
      toast.success('Inscription réussie ! Vérifiez votre email.');
    } catch (err: any) {
      if (err.response?.data?.details) {
        const labels: Record<string, string> = {
          firstName: 'Prénom', lastName: 'Nom', email: 'E-mail',
          password: 'Mot de passe', passwordConfirm: 'Confirmation', country: 'Pays',
        };
        setError(
          err.response.data.details
            .map((d: any) => `${labels[d.field] ?? d.field} : ${d.message}`)
            .join('\n')
        );
        toast.error('Veuillez corriger les erreurs du formulaire.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Une erreur est survenue.';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-gradient p-12">
        <Link to="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
          <div className="w-10 h-10 bg-white/15 border border-white/25 rounded-xl flex items-center justify-center p-2 backdrop-blur-sm">
            <img src={grioteLogo} alt="Griote" className="w-full h-full" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Griote Foundation</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="text-2xl font-semibold text-white leading-snug">
            "Rejoignez la communauté<br />
            <span className="text-amber-300">des chercheurs africains.</span>"
          </blockquote>
          <p className="text-white/65 text-sm leading-relaxed max-w-sm">
            Dépôts de recherche, articles, archives culturelles — tout le patrimoine africain en un seul lieu.
          </p>
          <ul className="space-y-2">
            {['Accès à des milliers de dépôts', 'Partage de vos recherches', 'Réseau de chercheurs africains'].map(txt => (
              <li key={txt} className="flex items-center gap-2.5 text-sm text-white/80">
                <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                {txt}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/40 text-xs">© {new Date().getFullYear()} Griote Foundation</p>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center p-2">
              <img src={grioteLogo} alt="Griote" className="w-full h-full" />
            </div>
            <span className="text-lg font-bold text-foreground">Griote Foundation</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6 py-6">
          {/* ── Success state ─────────────────────────────────── */}
          {success ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Inscription réussie !</h2>
                <p className="text-sm text-muted-foreground">
                  Un email de vérification a été envoyé à{' '}
                  <span className="font-medium text-foreground">{formData.email}</span>.
                  <br />Vérifiez votre boîte de réception.
                </p>
              </div>
              <Link
                to="/connexion"
                className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
              >
                Aller à la connexion <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center">
                <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Retour à l'accueil
                </Link>
              </p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Créer un compte</h1>
                <p className="text-sm text-muted-foreground">Remplissez les informations ci-dessous.</p>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2.5 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Prénom + Nom */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="firstName" type="text" placeholder="Prénom"
                        value={formData.firstName}
                        onChange={e => set('firstName', e.target.value)}
                        className="pl-9 h-10" required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="lastName" type="text" placeholder="Nom"
                        value={formData.lastName}
                        onChange={e => set('lastName', e.target.value)}
                        className="pl-9 h-10" required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email" type="email" placeholder="votre@email.com"
                      value={formData.email}
                      onChange={e => set('email', e.target.value)}
                      className="pl-9 h-10" required
                    />
                  </div>
                </div>

                {/* Pays */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Pays <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                {formData.country === c.code && <Check className="h-4 w-4 text-amber-400" />}
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
                                {formData.country === c.code && <Check className="h-4 w-4 text-amber-400" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Mot de passe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => set('password', e.target.value)}
                        className="pl-9 pr-9 h-10" required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmation</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => set('confirmPassword', e.target.value)}
                        className="pl-9 pr-9 h-10" required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground -mt-1">
                  Min. 8 caractères avec majuscule, minuscule et chiffre.
                </p>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Création du compte…</>
                  ) : (
                    <>Créer mon compte <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">Déjà un compte ?</span>
                </div>
              </div>

              <Link
                to="/connexion"
                className="flex w-full h-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
              >
                Se connecter
              </Link>

              <p className="text-center">
                <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  ← Retour à l'accueil
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
