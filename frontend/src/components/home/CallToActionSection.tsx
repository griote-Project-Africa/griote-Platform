import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CallToActionSection = () => {
  return (
    <section className="bg-primary-gradient py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-white/15 pb-10 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
               style={{ color: 'hsl(var(--accent) / 0.8)' }}>
              Rejoignez-nous
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-xl tracking-tight">
              Prêt à rejoindre la communauté
              <br />panafricaine du savoir ?
            </h2>
          </div>
          <p className="text-sm lg:text-base text-white/60 max-w-xs leading-relaxed">
            Partagez vos recherches, découvrez de nouveaux savoirs et accédez aux meilleures
            opportunités académiques et technologiques.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/inscription">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold px-7"
              style={{ borderRadius: '2px' }}
            >
              Créer un compte
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/a-propos">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white/25 text-white bg-transparent hover:bg-white/10 font-semibold px-7"
              style={{ borderRadius: '2px' }}
            >
              En savoir plus
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CallToActionSection;
