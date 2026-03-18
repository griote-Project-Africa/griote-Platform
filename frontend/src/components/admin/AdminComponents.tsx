import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ── Design tokens ──────────────────────────────────────────────────────────
export const STATUS_CLASSES = {
  PUBLISHED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  PENDING:   'bg-amber-500/15  text-amber-400  border border-amber-500/25',
  REJECTED:  'bg-red-500/15    text-red-400    border border-red-500/25',
  ARCHIVED:  'bg-slate-500/15  text-slate-400  border border-slate-500/25',
  DRAFT:     'bg-muted/50      text-muted-foreground border border-border',
} as const;

export const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Publié',
  PENDING:   'En attente',
  REJECTED:  'Rejeté',
  ARCHIVED:  'Archivé',
  DRAFT:     'Brouillon',
};

/* ─────────────────────────────────────────
   StatusBadge  (shared across all admin sections)
───────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASSES[status as keyof typeof STATUS_CLASSES] ?? STATUS_CLASSES.DRAFT;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full tracking-wide', cls)}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

/* ─────────────────────────────────────────
   AdminPageHeader
───────────────────────────────────────── */
interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({ title, description, action, className }: AdminPageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8', className)}>
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   AdminStatsCard
───────────────────────────────────────── */
interface AdminStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  iconColor?: string;
  accentColor?: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
  active?: boolean;
}

export function AdminStatsCard({
  title, value, description, icon, iconColor, accentColor, trend, onClick, active,
}: AdminStatsCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'relative w-full text-left bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-150 overflow-hidden',
        onClick && 'hover:border-border/80 hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        active && 'border-amber-500/40 bg-amber-500/5',
      )}
    >
      {/* Left accent line */}
      {accentColor && (
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
          style={{ background: accentColor }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tracking-tight truncate">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              {trend && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 font-semibold',
                  trend.isPositive ? 'text-emerald-400' : 'text-red-400',
                )}>
                  {trend.isPositive
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {description}
            </p>
          )}
        </div>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0${!iconColor ? ' bg-primary/10' : ''}`}
          style={{ background: iconColor ? `${iconColor}22` : undefined }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
    </Tag>
  );
}

/* ─────────────────────────────────────────
   AdminCard (generic section container)
───────────────────────────────────────── */
interface AdminCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function AdminCard({ title, description, children, className, icon, action, noPadding }: AdminCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl shadow-sm overflow-hidden', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
              {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AdminEmptyState
───────────────────────────────────────── */
interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function AdminEmptyState({ title, description, icon, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="h-14 w-14 rounded-full bg-muted/40 border border-border flex items-center justify-center mb-5 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mb-5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   AdminTable primitives
───────────────────────────────────────── */
interface TableProps { children: React.ReactNode; className?: string }

export function AdminTable({ children, className }: TableProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

export function AdminTableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/40 border-b border-border">{children}</thead>;
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/60">{children}</tbody>;
}

export function AdminTableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('hover:bg-muted/20 transition-colors duration-100', className)}>
      {children}
    </tr>
  );
}

export function AdminTableHead({ children, className }: TableProps) {
  return (
    <th className={cn('px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-widest', className)}>
      {children}
    </th>
  );
}

export function AdminTableCell({ children, className }: TableProps) {
  return (
    <td className={cn('px-4 py-3.5 text-sm text-foreground', className)}>
      {children}
    </td>
  );
}

/* ─────────────────────────────────────────
   ActionButton  (icon-only with hover ring)
───────────────────────────────────────── */
interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  disabled?: boolean;
}

const VARIANT_STYLES = {
  default:  'text-muted-foreground hover:text-foreground hover:bg-muted/60 border-border/60',
  danger:   'text-red-400 hover:text-red-300 hover:bg-red-500/15 border-red-500/20',
  success:  'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/15 border-emerald-500/20',
  warning:  'text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 border-amber-500/20',
  info:     'text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 border-blue-500/20',
} as const;

export function ActionButton({ icon, title, onClick, variant = 'default', disabled }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'h-8 w-8 flex items-center justify-center rounded-lg border transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANT_STYLES[variant],
      )}
    >
      <span className="h-3.5 w-3.5 flex items-center justify-center">{icon}</span>
    </button>
  );
}

/* ─────────────────────────────────────────
   GoldButton  (primary CTA)
───────────────────────────────────────── */
interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export function GoldButton({ children, onClick, disabled, type = 'button', size = 'md', className, icon }: GoldButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
        'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300',
        className,
      )}
    >
      {icon && <span className="h-4 w-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   SearchInput  (with icon prefix)
───────────────────────────────────────── */
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher...', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition"
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   UserAvatar
───────────────────────────────────────── */
const AVATAR_COLORS = [
  'hsl(217 91% 55%)', 'hsl(142 71% 38%)', 'hsl(258 90% 55%)',
  'hsl(43 96% 50%)',  'hsl(189 94% 38%)', 'hsl(0 84% 55%)',
  'hsl(330 81% 55%)', 'hsl(168 76% 38%)',
];

export function UserAvatar({ firstName, lastName, size = 8 }: {
  firstName: string; lastName: string; size?: number;
}) {
  const code = (firstName.charCodeAt(0) || 0) + (lastName.charCodeAt(0) || 0);
  const color = AVATAR_COLORS[code % AVATAR_COLORS.length];
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  return (
    <div
      className={`h-${size} w-${size} rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}
