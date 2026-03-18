// src/components/Layout/Header.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Home, Search, Megaphone, Info, FileText, User, LogIn, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/useAuth";
import { Button } from "@/components/ui/button";

import GrioteLogo from "@/assets/griote.svg";

const getNavItems = (isAuthenticated: boolean) => {
  const baseItems = [
    { name: "Explorer", href: "/depots", icon: Search },
    { name: "Articles", href: "/articles", icon: FileText },
    { name: "Annonces", href: "/annonces", icon: Megaphone },
    { name: "À propos", href: "/a-propos", icon: Info },
  ];

  if (!isAuthenticated) {
    return [{ name: "Accueil", href: "/", icon: Home }, ...baseItems];
  }

  return baseItems;
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, logout, isLoading, user } = useAuth();

  const navItems = getNavItems(isAuthenticated);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-white/95 backdrop-blur-md w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-15 sm:h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={GrioteLogo} alt="Griote Foundation" className="h-8 sm:h-9 w-auto" />
            <div className="flex flex-col leading-none">
              <span className="text-base sm:text-lg font-bold text-primary tracking-tight">Griote</span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-muted-foreground -mt-0.5">
                Project-Africa
              </span>
            </div>
          </Link>

          {/* ── Desktop navigation ── */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-foreground/60 hover:text-foreground"
                    )}
                    style={isActive ? {
                      boxShadow: 'inset 0 -2px 0 hsl(var(--accent))'
                    } : {}}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ── Desktop actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2">
              {isLoading ? (
                <span className="text-sm text-muted-foreground px-2">Chargement…</span>
              ) : !isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                    <Link to="/connexion">Se connecter</Link>
                  </Button>
                  <Button size="sm" asChild className="text-sm font-semibold"
                    style={{ background: 'hsl(var(--accent))', color: '#fff', borderRadius: '3px' }}>
                    <Link to="/inscription">S'inscrire</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="text-sm font-medium">
                    <Link to="/mon-compte">
                      <User className="h-4 w-4 mr-1.5" />
                      Mon compte
                    </Link>
                  </Button>
                  {user?.role === "ADMIN" && (
                    <Button size="sm" asChild className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                      <Link to="/admin/stats">
                        <Shield className="h-4 w-4 mr-1.5" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:inline ml-1.5">Déconnexion</span>
                  </Button>
                </>
              )}
            </div>

            {/* ── Mobile burger ── */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground/70"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen
                ? <X className="h-5 w-5" />
                : <Menu className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/60 bg-white/98 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">

            {/* Navigation links */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/8 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}

            {/* Auth actions */}
            <div className="pt-3 mt-2 border-t border-border space-y-2">
              {isLoading ? (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Chargement…
                </div>
              ) : !isAuthenticated ? (
                <>
                  <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Se connecter
                    </Button>
                  </Link>
                  <Link to="/inscription" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center gap-2 font-semibold"
                      style={{ background: 'hsl(var(--accent))', color: '#fff', borderRadius: '3px' }}>
                      <User className="h-4 w-4" />
                      S'inscrire
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/mon-compte" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <User className="h-4 w-4" />
                      Mon compte
                    </Button>
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link to="/admin/stats" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                        <Shield className="h-4 w-4" />
                        Panneau d'administration
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
