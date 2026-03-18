import React from 'react';
import { Mail, Linkedin, User } from 'lucide-react';

interface Executive {
  name: string;
  role: string;
  image?: string;
  contact?: {
    email?: string;
    linkedin?: string;
  };
}

/* ─────────────────────────────────────────────────────
   ExecutiveCard — layout horizontal éditorial
   Inspiré des pages "faculty" des universités
───────────────────────────────────────────────────── */
export const ExecutiveCard = ({ executive }: { executive: Executive }) => {
  const { name, role, image, contact } = executive;

  return (
    <div className="group flex flex-col sm:flex-row gap-0 overflow-hidden border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
         style={{ borderRadius: '2px' }}>

      {/* Portrait */}
      <div className="relative sm:w-44 lg:w-52 h-52 sm:h-auto shrink-0 overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
            style={{ filter: 'grayscale(12%) contrast(105%)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        {/* Gold accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5"
             style={{ background: 'hsl(var(--accent))' }} />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-6 lg:p-8 flex-1 min-w-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-2"
             style={{ color: 'hsl(var(--accent))' }}>
            {role}
          </p>
          <h3 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight leading-tight mb-4">
            {name}
          </h3>
          <div className="w-8 h-px bg-border mb-4" />
        </div>

        {contact && (contact.email || contact.linkedin) && (
          <div className="flex items-center gap-4 mt-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                title={contact.email}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors duration-150"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            )}
            {contact.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#0077B5] transition-colors duration-150"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────
   ContributorCard — portrait vertical compact
───────────────────────────────────────────────────── */
export const ContributorCard = ({ executive }: { executive: Executive }) => {
  const { name, role, image } = executive;

  return (
    <div className="group flex flex-col overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200"
         style={{ borderRadius: '2px' }}>
      <div className="relative h-32 lg:h-40 overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-400"
            style={{ filter: 'grayscale(8%)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </div>
      <div className="p-4">
        <p className="font-semibold text-sm text-foreground leading-snug">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{role}</p>
      </div>
    </div>
  );
};

/* Divider — fine ligne typographique */
export const Divider = () => (
  <div className="flex items-center gap-4 my-8 lg:my-12">
    <div className="flex-1 h-px bg-border" />
    <div className="w-1.5 h-1.5 rounded-full"
         style={{ background: 'hsl(var(--accent))' }} />
    <div className="flex-1 h-px bg-border" />
  </div>
);
