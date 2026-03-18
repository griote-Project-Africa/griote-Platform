import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/auth/useAuth';
import { resendVerificationEmail } from '@/services/auth.service';
import { toast } from 'sonner';
import grioteLogo from '@/assets/griote.svg';

export default function Connexion() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading]       = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  // After login, redirect to the page the user was trying to access, or fallback
  const from = (location.state as any)?.from?.pathname ?? '/mon-compte';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setEmailNotVerified(false);
    try {
      const response = await login(email, password);
      if (response.requiresInterfaceSelection) {
        navigate('/interface-selection');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const code = err.response?.data?.code;
      setEmailNotVerified(code === 'EMAIL_NOT_VERIFIED');
      if (err.response?.data?.details) {
        setError(err.response.data.details.map((d: any) => `${d.field}: ${d.message}`).join(', '));
      } else {
        setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail(email);
      toast.success('Email de vérification envoyé.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel (desktop only) ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-gradient p-12">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
          <div className="w-10 h-10 bg-white/15 border border-white/25 rounded-xl flex items-center justify-center p-2 backdrop-blur-sm">
            <img src={grioteLogo} alt="Griote" className="w-full h-full" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Griote Foundation</span>
        </Link>

        {/* Quote */}
        <div className="space-y-6">
          <blockquote className="text-2xl font-semibold text-white leading-snug">
            "Préserver la mémoire africaine,<br />
            <span className="text-amber-300">partager la connaissance.</span>"
          </blockquote>
          <p className="text-white/65 text-sm leading-relaxed max-w-sm">
            Rejoignez des milliers de chercheurs, historiens et passionnés qui explorent et partagent le patrimoine culturel africain.
          </p>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs">© {new Date().getFullYear()} Griote Foundation</p>
      </div>

      {/* ── Right panel (form) ─────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-background min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center p-2">
              <img src={grioteLogo} alt="Griote" className="w-full h-full" />
            </div>
            <span className="text-lg font-bold text-foreground">Griote Foundation</span>
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-7">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground">Entrez vos identifiants pour accéder à votre espace.</p>
          </div>

          {/* Alerts */}
          {error && !emailNotVerified && (
            <Alert variant="destructive" className="py-2.5 text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {emailNotVerified && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm font-medium text-foreground">Email non vérifié</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Vérifiez votre boîte mail et cliquez sur le lien de confirmation.
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
              >
                {resendLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                Renvoyer l'email de vérification
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 h-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <Link to="/mot-de-passe-oublie" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10"
                  required
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Connexion…</>
              ) : (
                <>Se connecter <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">Pas encore de compte ?</span>
            </div>
          </div>

          <Link
            to="/inscription"
            className="flex w-full h-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            Créer un compte
          </Link>

          <p className="text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
