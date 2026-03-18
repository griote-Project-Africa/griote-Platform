// src/components/Layout/Footer.tsx
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight, MapPin } from "lucide-react";

const IconGithub = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const IconX = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconLinkedin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import { useAuth } from "@/auth/useAuth";
import GrioteLogo from "@/assets/griote.svg";

const NAV_PLATFORM = [
  { label: "Explorer les dépôts", href: "/depots" },
  { label: "Articles",            href: "/articles" },
  { label: "Annonces",            href: "/annonces" },
  { label: "Projets open source", href: "/projets-open-source" },
];

const NAV_COMMUNITY = [
  { label: "À propos",         href: "/a-propos" },
  { label: "Bureau exécutif",  href: "/a-propos/bureau-executif" },
  { label: "Contributeurs",    href: "/a-propos/contributeurs" },
];

const SOCIALS = [
  { href: "https://github.com/griote-foundation",           Icon: IconGithub,   label: "GitHub" },
  { href: "https://twitter.com/griotefdn",                  Icon: IconX,        label: "X" },
  { href: "https://linkedin.com/company/griote-foundation", Icon: IconLinkedin, label: "LinkedIn" },
];

export default function Footer() {
  const { isAuthenticated, user } = useAuth();

  return (
    <footer
      className="relative"
      style={{ background: "hsl(222 47% 9%)" }}
    >
      {/* ── Gold accent top border ─────────────────────────────────────── */}
      <div
        className="h-[2px] w-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(43 74% 49%) 30%, hsl(38 80% 55%) 70%, transparent 100%)",
        }}
      />

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Col 1 : Identity ──────────────────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <img src={GrioteLogo} alt="Griote" className="h-9 w-auto" />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold text-white tracking-tight">Griote</span>
                <span
                  className="text-[9px] uppercase tracking-[0.18em] mt-0.5"
                  style={{ color: "hsl(43 74% 49% / 0.75)" }}
                >
                  Project-Africa
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(213 31% 72%)" }}>
              Plateforme panafricaine dédiée à la structuration,
              la transmission et la valorisation des savoirs
              africains, académiques et technologiques.
            </p>

            {/* Location tag */}
            <div
              className="inline-flex items-center gap-1.5 text-xs mb-6 px-2.5 py-1 rounded-full border"
              style={{
                color: "hsl(43 74% 55%)",
                borderColor: "hsl(43 74% 49% / 0.25)",
                background: "hsl(43 74% 49% / 0.07)",
              }}
            >
              <MapPin className="h-3 w-3" />
              Afrique &rarr; Monde
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {SOCIALS.map(({ href, Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
                  style={{
                    background: "hsl(222 40% 16%)",
                    color: "hsl(213 31% 60%)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "hsl(43 74% 49% / 0.15)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "hsl(43 74% 60%)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "hsl(222 40% 16%)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "hsl(213 31% 60%)";
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2 : Plateforme ────────────────────────────────────── */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: "hsl(43 74% 49%)" }}
            >
              Plateforme
            </p>
            <ul className="space-y-2.5">
              {NAV_PLATFORM.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors duration-150"
                    style={{ color: "hsl(213 31% 65%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(213 31% 65%)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3 : Communauté ────────────────────────────────────── */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: "hsl(43 74% 49%)" }}
            >
              Communauté
            </p>
            <ul className="space-y-2.5">
              {NAV_COMMUNITY.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors duration-150"
                    style={{ color: "hsl(213 31% 65%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(213 31% 65%)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Auth-conditional links */}
              <li>
                {!isAuthenticated ? (
                  <Link
                    to="/connexion"
                    className="text-sm transition-colors duration-150"
                    style={{ color: "hsl(213 31% 65%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(213 31% 65%)")}
                  >
                    Se connecter
                  </Link>
                ) : (
                  <Link
                    to="/mon-compte"
                    className="text-sm transition-colors duration-150"
                    style={{ color: "hsl(213 31% 65%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(213 31% 65%)")}
                  >
                    Mon espace
                  </Link>
                )}
              </li>

              {isAuthenticated && user?.role === "ADMIN" && (
                <li>
                  <Link
                    to="/admin/stats"
                    className="text-sm transition-colors duration-150"
                    style={{ color: "hsl(213 31% 65%)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "hsl(213 31% 65%)")}
                  >
                    Administration
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* ── Col 4 : Contact ───────────────────────────────────────── */}
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: "hsl(43 74% 49%)" }}
            >
              Contact
            </p>

            <p className="text-xs mb-4 leading-relaxed" style={{ color: "hsl(213 31% 55%)" }}>
              Une question, un partenariat ou une contribution ?
              Notre équipe vous répond.
            </p>

            <a
              href="mailto:contact@griote.foundation"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-150"
              style={{
                background: "hsl(43 74% 49% / 0.12)",
                color: "hsl(43 74% 60%)",
                border: "1px solid hsl(43 74% 49% / 0.25)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "hsl(43 74% 49% / 0.22)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "hsl(43 74% 49% / 0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "hsl(43 74% 49% / 0.12)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "hsl(43 74% 49% / 0.25)";
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              contact@griote.foundation
            </a>
          </div>

        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div
          className="mt-12 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ borderTop: "1px solid hsl(222 35% 17%)" }}
        >
          <span style={{ color: "hsl(213 31% 40%)" }}>
            © {new Date().getFullYear()} Griote Foundation — Tous droits réservés
          </span>
          <a
            href="https://griote.foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium transition-colors duration-150"
            style={{ color: "hsl(43 74% 45%)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "hsl(43 74% 62%)")}
            onMouseLeave={e => (e.currentTarget.style.color = "hsl(43 74% 45%)")}
          >
            griote.foundation
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

      </div>
    </footer>
  );
}
