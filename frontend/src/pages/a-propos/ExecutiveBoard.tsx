import React from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { ExecutiveCard, Divider } from '@/components/apropos';
import DanielImg  from '@/assets/staff/Daniel.jpeg';
import IdrissImg  from '@/assets/staff/Idriss.jpeg';
import BrandonImg from '@/assets/staff/Brandon.jpeg';

const executives = [
  {
    name: "M. Daniel Ekwel",
    role: "Président National",
    image: DanielImg,
    contact: {
      email: "danielekwel4@gmail.com",
      linkedin: "https://www.linkedin.com/in/daniel-ekwel",
    },
  },
  {
    name: "M. Nango Idriss",
    role: "Vice-Président 1",
    image: IdrissImg,
    contact: {
      email: "vice-president@griote.foundation",
      linkedin: "https://www.linkedin.com/in/idriss-nango-706abb253",
    },
  },
  {
    name: "M. Kamga Brandon",
    role: "Vice-Président 2",
    image: BrandonImg,
    contact: {
      email: "brandonkamga237@gmail.com",
      linkedin: "https://www.linkedin.com/in/brandon-duclerc-tamwa-kamga/",
    },
  },
];

const ExecutiveBoard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* ─── En-tête de page éditorial ─── */}
      <div className="pt-24 pb-0 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

          {/* Surtitre */}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'hsl(var(--accent))' }}>
            Griote Project-Africa — Gouvernance
          </p>

          {/* Titre principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight mb-6">
            Bureau Exécutif
          </h1>

          {/* Description + règle */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8">
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              L'équipe dirigeante de Griote Project-Africa. Des hommes engagés
              pour la valorisation du savoir africain, académique et technologique.
            </p>
            <p className="text-sm text-muted-foreground/60 whitespace-nowrap">
              {executives.length} membres
            </p>
          </div>

        </div>
      </div>

      {/* ─── Contenu principal ─── */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-14 lg:py-20">

        {/* Président */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: 'hsl(var(--accent))' }}>
            Présidence
          </p>
          <div className="max-w-2xl">
            <ExecutiveCard executive={executives[0]} />
          </div>
        </section>

        <Divider />

        {/* Vice-présidents */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: 'hsl(var(--accent))' }}>
            Direction exécutive
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            {executives.slice(1).map(exec => (
              <ExecutiveCard key={exec.name} executive={exec} />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ExecutiveBoard;
