import React, { useState, useEffect } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/useAuth';
import { Link } from 'react-router-dom';
import { Archive, Lightbulb, Target, ArrowRight, Mail } from 'lucide-react';

const APropos = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const pilliers = [
    {
      number: '01',
      icon: Archive,
      title: 'Préservation & Diffusion',
      description:
        'Archiver les travaux académiques africains et les rendre accessibles mondialement, pour que chaque thèse, mémoire ou recherche soit visible, citée et réutilisable.',
    },
    {
      number: '02',
      icon: Lightbulb,
      title: 'Innovation & Souveraineté',
      description:
        'Développer Griote AI et des projets open source entraînés sur nos savoirs et langues, pour une technologie véritablement adaptée à nos réalités.',
    },
    {
      number: '03',
      icon: Target,
      title: 'Excellence & Collaboration',
      description:
        "Promouvoir l'excellence académique africaine et favoriser les partenariats panafricains et internationaux.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* ═══════════════════════════════════════════
          HERO — typographie éditoriale pure
      ═══════════════════════════════════════════ */}
      <section className="relative bg-primary-gradient overflow-hidden">
        {/* Ligne décorative haute */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

        <div
          className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-32 pb-20 lg:pt-40 lg:pb-28
                       transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Surtitre */}
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50 mb-6">
            Griote Project-Africa
          </p>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-8 max-w-4xl">
            La mémoire, le savoir
            <br />
            et l'innovation africaine
            <br />
            <span style={{ color: 'hsl(var(--accent))' }}>réunis en un écosystème.</span>
          </h1>

          {/* Règle + accroche */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-start pt-6 border-t border-white/15">
            <p className="text-base lg:text-lg text-white/70 max-w-lg leading-relaxed">
              Faire de l'Afrique un leader mondial du savoir en préservant et valorisant
              ses propres productions intellectuelles et technologiques.
            </p>
            <div className="flex gap-3 shrink-0">
              <Link to="/inscription">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-6"
                  style={{ borderRadius: '2px' }}
                >
                  Rejoindre
                </Button>
              </Link>
              <Link to="/depots">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10 font-semibold px-6"
                  style={{ borderRadius: '2px' }}
                >
                  Explorer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MISSION — piliers éditoriaux
      ═══════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

          {/* En-tête de section */}
          <div className="mb-14 lg:mb-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'hsl(var(--accent))' }}>
              Ce qui nous définit
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight max-w-2xl">
              Notre mission, notre vision,<br />nos valeurs
            </h2>
          </div>

          {/* Grille : piliers gauche + images droite */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Piliers */}
            <div className="space-y-0 divide-y divide-border">
              {pilliers.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.number} className="flex gap-6 py-8 first:pt-0 last:pb-0">
                    {/* Numéro */}
                    <span className="text-xs font-mono mt-1 w-6 shrink-0 font-semibold"
                          style={{ color: 'hsl(var(--accent))' }}>
                      {p.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <Icon className="w-4 h-4 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">
                          {p.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mosaïque d'images */}
            <div className="grid grid-cols-2 gap-3">
              <img
                src="https://www.shutterstock.com/image-photo/male-female-doctors-diverse-backgrounds-600nw-2673117813.jpg"
                alt="Chercheurs africains"
                className="object-cover h-48 lg:h-60 w-full"
                style={{ borderRadius: '2px' }}
              />
              <img
                src="https://i0.wp.com/livingopensource.org/wp-content/uploads/2024/06/Living-Open-Source-training-in-Kenya.jpg?resize=1024%2C682&ssl=1"
                alt="Formation open source"
                className="object-cover h-48 lg:h-60 w-full mt-6"
                style={{ borderRadius: '2px' }}
              />
              <img
                src="https://i.natgeofe.com/n/6d15d22a-e7f9-45b1-966b-812935567f6c/RSTimbuktuLead1.jpg"
                alt="Manuscrits de Tombouctou"
                className="object-cover h-48 lg:h-60 w-full"
                style={{ borderRadius: '2px' }}
              />
              <img
                src="https://c76c7bbc41.mjedge.net/wp-content/uploads/tc/2025/12/young-people-computer.jpg"
                alt="Jeunes africains et technologie"
                className="object-cover h-48 lg:h-60 w-full mt-6"
                style={{ borderRadius: '2px' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ÉQUIPE — lien vers le bureau exécutif
      ═══════════════════════════════════════════ */}
      <section className="border-t border-border py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'hsl(var(--accent))' }}>
                Les personnes
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-5">
                Une équipe engagée
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                Griote Project-Africa est porté par des femmes et des hommes qui croient
                en la souveraineté intellectuelle du continent africain.
                Le bureau exécutif pilote la vision et les décisions stratégiques du projet.
              </p>
              <Link to="/a-propos/bureau-executif">
                <Button
                  size="lg"
                  variant="outline"
                  className="inline-flex items-center gap-2 font-semibold border-foreground/20"
                  style={{ borderRadius: '2px' }}
                >
                  Voir le bureau exécutif
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Image éditoriale */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1600&auto=format&fit=crop"
                alt="Équipe en réunion"
                className="w-full h-72 lg:h-80 object-cover"
                style={{ borderRadius: '2px', filter: 'grayscale(10%) contrast(103%)' }}
              />
              {/* Accent bar — or */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5"
                   style={{ background: 'hsl(var(--accent))' }} />
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL — sobre
      ═══════════════════════════════════════════ */}
      <section className="bg-primary-gradient py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-white/15 pb-10 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                 style={{ color: 'hsl(var(--accent) / 0.85)' }}>
                Rejoignez-nous
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-xl">
                Rejoindre & contribuer
                <br />au savoir africain
              </h2>
            </div>
            <p className="text-sm lg:text-base text-white/60 max-w-sm leading-relaxed">
              Un espace ouvert à tous ceux qui produisent et valorisent le savoir africain.
              Chercheurs, étudiants, professionnels — votre contribution compte.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/inscription">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
                style={{ borderRadius: '2px' }}
              >
                Commencer
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="mailto:contact@griote.foundation">
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 text-white bg-transparent hover:bg-white/10 font-semibold w-full sm:w-auto"
                style={{ borderRadius: '2px' }}
              >
                Nous contacter
                <Mail className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};

export default APropos;
