import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import grioteImage from "../../assets/griote.jpg";

export const HeroSection = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full bg-background overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch lg:min-h-screen">

          {/* ── Colonne texte ── */}
          <div
            className={`flex flex-col justify-center pt-12 pb-10 sm:pt-16 sm:pb-12 lg:py-28 pr-0 lg:pr-16
                         transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em] mb-6 sm:mb-8"
              style={{ color: 'hsl(var(--accent))' }}
            >
              Plateforme académique panafricaine
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.08] tracking-tight mb-5">
              Bâtir la souveraineté africaine
              <br />
              <span className="text-primary">
                à partir de nos{" "}
                <span className="relative inline-block">
                  propres savoirs
                  <span
                    className="absolute -bottom-1 left-0 w-full h-0.5"
                    style={{ background: 'hsl(var(--accent))' }}
                  />
                </span>
              </span>
            </h1>

            <div className="w-12 h-px mb-5" style={{ background: 'hsl(var(--accent) / 0.4)' }} />

            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
              Griote Project-Africa valorise, structure et transmet les connaissances
              africaines — académiques, culturelles et technologiques.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/depots">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7"
                  style={{ borderRadius: '2px' }}
                >
                  Explorer les dépôts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/a-propos">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto font-semibold px-7 border-border hover:bg-muted"
                  style={{ borderRadius: '2px' }}
                >
                  En savoir plus
                </Button>
              </Link>
            </div>

            <div className="mt-10 sm:mt-14 pt-6 border-t border-border">
              <blockquote className="flex gap-3 items-start">
                <span className="text-2xl leading-none mt-0.5" style={{ color: 'hsl(var(--accent))' }}>"</span>
                <div>
                  <p className="text-sm italic text-muted-foreground">
                    La mémoire des ancêtres éclaire le chemin de nos savoirs.
                  </p>
                  <cite className="text-xs text-muted-foreground/50 not-italic mt-1 block">
                    — Griote & Coaue
                  </cite>
                </div>
              </blockquote>
            </div>
          </div>

          {/* ── Colonne image ── */}
          {/* Desktop : colonne pleine hauteur */}
          <div
            className={`hidden lg:block relative overflow-hidden
                         transition-all duration-700 delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border z-10" />
            <img
              src={grioteImage}
              alt="Sage africain — Gardien de la tradition orale"
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ filter: 'grayscale(15%) contrast(105%) brightness(103%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
          </div>

          {/* Mobile : image sous le texte, dans la grille */}
          <div
            className={`lg:hidden relative w-full h-52 sm:h-72 overflow-hidden
                         transition-all duration-700 delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={grioteImage}
              alt="Sage africain"
              className="w-full h-full object-cover object-top"
              style={{ filter: 'grayscale(15%) contrast(105%)' }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
