import React from "react";
import { Archive, Megaphone, Code2, BrainCircuit, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  {
    icon: Archive,
    title: "Dépôts de connaissances",
    description:
      "Thèses, mémoires, rapports académiques, datasets, cours — toute la connaissance africaine devient visible, citée et réutilisable.",
    href: "/depots",
    points: ["Accès ouvert à tous", "Souveraineté de la connaissance", "Valorisation des savoirs locaux"],
    featured: true,
  },
  {
    icon: Megaphone,
    title: "Opportunités ciblées",
    description: "Bourses, appels à projets et collaborations stratégiques pour la communauté africaine.",
    href: "/annonces",
    points: ["Bourses et financements", "Recherche indépendante", "Réseau continental"],
    featured: false,
  },
  {
    icon: Code2,
    title: "Projets open source",
    description: "Logiciels ouverts conçus pour les réalités africaines.",
    href: "/projets-open-source",
    points: ["Collaboration ouverte", "Outils souverains", "Innovation locale"],
    featured: false,
  },
  {
    icon: BrainCircuit,
    title: "Griote AI",
    description: "Une intelligence artificielle entraînée sur nos savoirs, nos langues et nos contextes culturels.",
    href: "#",
    points: ["IA contextualisée", "Langues africaines", "Savoirs traditionnels et modernes"],
    featured: false,
  },
];

export default function EcosystemSection() {
  const [featured, ...rest] = items;
  const FeaturedIcon = featured.icon;

  return (
    <section className="py-20 lg:py-28 border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête de section */}
        <div className="mb-14 lg:mb-20 max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
             style={{ color: 'hsl(var(--accent))' }}>
            L'écosystème Griote
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight">
            Un écosystème au service
            <br />
            <span className="text-primary">de la souveraineté du savoir africain</span>
          </h2>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-border" style={{ borderRadius: '2px' }}>

          {/* Carte principale — pleine hauteur colonne gauche */}
          <div className="lg:row-span-2 bg-primary p-8 lg:p-10 flex flex-col justify-between min-h-64 lg:min-h-0 border-b lg:border-b-0 lg:border-r border-white/15 relative overflow-hidden">
            {/* Gold top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'hsl(var(--accent))' }} />
            <div>
              <FeaturedIcon className="w-10 h-10 text-white/80 mb-8" />
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 leading-tight">
                {featured.title}
              </h3>
              <p className="text-sm lg:text-base text-white/70 leading-relaxed mb-8">
                {featured.description}
              </p>
              <ul className="space-y-2.5">
                {featured.points.map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-white/80">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-white/60 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to={featured.href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors mt-10 group"
            >
              Découvrir les dépôts
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 3 cartes secondaires */}
          {rest.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === rest.length - 1;
            return (
              <div
                key={item.title}
                className={`p-7 lg:p-8 flex flex-col justify-between bg-card hover:bg-muted/40 transition-colors duration-150
                             border-b border-border lg:border-b-0
                             ${i < rest.length - 1 ? 'lg:border-b border-border' : ''}
                             ${!isLast ? 'border-b' : ''}`}
              >
                <div>
                  <Icon className="w-7 h-7 text-primary mb-5" />
                  <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {item.href !== "#" && (
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-6 group"
                  >
                    Explorer
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
