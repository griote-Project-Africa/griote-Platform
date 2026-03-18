import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Announcement } from '@/types/announcement';

function getAnnouncementColor(seed: string): string {
  const palette = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#14b8a6', '#6366f1', '#f97316',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
  return palette[Math.abs(h) % palette.length];
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onView?: (id: string) => void;
  className?: string;
}

const AnnouncementCard = ({ announcement, className = '' }: AnnouncementCardProps) => {
  const navigate = useNavigate();
  const color = getAnnouncementColor(announcement.title);
  const plain = stripHtml(announcement.content);
  const excerpt = plain.length > 120 ? plain.slice(0, 120) + '…' : plain;
  const date = announcement.published_at || announcement.created_at;

  return (
    <div
      className={`group cursor-pointer bg-white border border-slate-200 rounded-2xl overflow-hidden
                  hover:shadow-md hover:-translate-y-0.5 transition-all ${className}`}
      onClick={() => navigate(`/annonces/${announcement.announcement_id}`)}
    >
      {/* Cover */}
      <div className="aspect-video overflow-hidden">
        {announcement.cover_image_url ? (
          <img
            src={announcement.cover_image_url}
            alt={announcement.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}44)` }}
          >
            <span
              className="text-6xl font-black text-white/15 select-none"
              style={{ fontFamily: 'serif' }}
            >
              {announcement.title[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {announcement.is_featured && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider
                           text-primary bg-primary/8 px-2 py-0.5 rounded-full mb-2">
            À la une
          </span>
        )}
        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {announcement.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
