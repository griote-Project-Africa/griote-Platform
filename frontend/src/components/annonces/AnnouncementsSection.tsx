import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AnnouncementCard from './AnnouncementCard';
import { getPublishedAnnouncements } from '@/services/announcement.service';
import type { Announcement } from '@/types/announcement';

interface AnnouncementsSectionProps {
  announcements?: Announcement[];
  maxDisplay?: number;
  showFilters?: boolean;
  title?: string;
  subtitle?: string;
  onView?: (id: string) => void;
}

const AnnouncementsSection = ({
  announcements: propAnnouncements,
  maxDisplay = 6,
  showFilters = false,
  title = "Annonces",
  subtitle = "Découvrez les dernières opportunités",
  onView,
}: AnnouncementsSectionProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(propAnnouncements || []);
  const [loading, setLoading] = useState(!propAnnouncements);

  useEffect(() => {
    if (!propAnnouncements) {
      fetchAnnouncements();
    }
  }, [propAnnouncements]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getPublishedAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedAnnouncements = announcements.slice(0, maxDisplay);

  if (loading) {
    return (
      <section className="py-16 bg-warm-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-slate-gray">Chargement des annonces...</p>
          </div>
        </div>
      </section>
    );
  }


  if (displayedAnnouncements.length === 0) {
    return (
      <section className="py-16 bg-warm-cream">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">{title}</h2>
            <p className="text-slate-gray max-w-2xl mx-auto">{subtitle}</p>
          </div>
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-6">
              <Megaphone className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Aucune annonce pour le moment
            </h3>
            <p className="text-foreground/50 max-w-sm mx-auto">
              Revenez bientôt — de nouvelles opportunités sont régulièrement publiées pour la communauté.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-warm-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-3">{title}</h2>
          <p className="text-slate-gray max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedAnnouncements.map((announcement, index) => (
            <div
              key={announcement.announcement_id}
              className="transition-all duration-500 ease-out transform opacity-100 translate-y-0"
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              <AnnouncementCard
                announcement={announcement}
                onView={onView}
              />
            </div>
          ))}
        </div>

        {/* View All Button */}
        {announcements.length > maxDisplay && (
          <div className="text-center">
            <Link to="/annonces">
              <Button className="bg-antique-gold hover:bg-antique-gold/90 text-black px-8 py-3 font-medium rounded-lg">
                Voir toutes les annonces
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnnouncementsSection;
