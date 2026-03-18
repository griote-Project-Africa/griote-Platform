import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from 'recharts';
import {
  Activity, Download, Users, AlertTriangle, TrendingUp, TrendingDown,
  Globe, Zap, RefreshCw, ChevronDown,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin';
import * as A from '@/services/analytics.service';

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  blue:   'hsl(217 91% 60%)',
  green:  'hsl(142 71% 45%)',
  amber:  'hsl(43 96% 56%)',
  red:    'hsl(0 84% 60%)',
  purple: 'hsl(258 90% 66%)',
  cyan:   'hsl(189 94% 43%)',
  gold:   'hsl(43 96% 56%)',
  muted:  'hsl(215 20% 65%)',
};

const TAB_DAYS: Record<string, number> = { '7j': 7, '30j': 30, '90j': 90 };

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, delta, icon, color, loading,
}: {
  label: string;
  value: string | number;
  delta?: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}) {
  const up = delta !== undefined && delta >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="p-2 rounded-lg" style={{ background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-muted/40 animate-pulse rounded" />
      ) : (
        <span className="text-3xl font-bold tracking-tight">{value}</span>
      )}
      {delta !== undefined && !loading && (
        <div className="flex items-center gap-1 text-xs">
          {up
            ? <TrendingUp size={12} style={{ color: C.green }} />
            : <TrendingDown size={12} style={{ color: C.red }} />}
          <span style={{ color: up ? C.green : C.red }}>
            {up ? '+' : ''}{delta}% vs période préc.
          </span>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children, extra }: { title: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-base">{title}</h3>
        {extra}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ msg = 'Aucune donnée' }: { msg?: string }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{msg}</p>;
}

function ChartSkeleton({ h = 220 }: { h?: number }) {
  return <div className={`bg-muted/30 animate-pulse rounded-lg w-full`} style={{ height: h }} />;
}

const fmtDay = (d: string) => d?.slice(5); // MM-DD

// ── Heatmap ────────────────────────────────────────────────────────────────
function ActivityHeatmap({ data }: { data: A.HeatmapCell[] }) {
  if (!data.length) return <EmptyState />;
  const maxVal = Math.max(...data.map(d => d.event_count), 1);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const map = new Map<string, number>();
  data.forEach(d => map.set(`${d.day_of_week}-${d.hour_of_day}`, d.event_count));

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {/* Y axis labels */}
        <div className="flex flex-col gap-[2px] pt-5">
          {days.map(d => (
            <div key={d} className="text-[10px] text-muted-foreground w-7 h-4 flex items-center">{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div>
          <div className="flex gap-[2px] mb-1">
            {hours.map(h => (
              <div key={h} className="text-[9px] text-muted-foreground w-4 text-center">
                {h % 4 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {days.map((_, dow) => (
            <div key={dow} className="flex gap-[2px] mb-[2px]">
              {hours.map(hour => {
                const count = map.get(`${dow}-${hour}`) || 0;
                const intensity = count / maxVal;
                return (
                  <div
                    key={hour}
                    title={`${days[dow]} ${hour}h — ${count} events`}
                    className="w-4 h-4 rounded-[2px]"
                    style={{
                      background: count === 0
                        ? 'hsl(215 20% 20%)'
                        : `hsl(142 71% ${Math.round(20 + intensity * 40)}%)`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Geo table ──────────────────────────────────────────────────────────────
function GeoTable({ data }: { data: A.GeoRow[] }) {
  if (!data.length) return <EmptyState />;
  const max = data[0]?.total_events || 1;
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {data.slice(0, 20).map(row => (
        <div key={row.country_code} className="flex items-center gap-3">
          <span className="text-sm font-mono w-8 text-muted-foreground">{row.country_code}</span>
          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(row.total_events / max) * 100}%`, background: C.blue }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-12 text-right">{row.total_events}</span>
          <span className="text-xs text-muted-foreground w-16 text-right">{row.unique_users} users</span>
        </div>
      ))}
    </div>
  );
}

// ── Error table ────────────────────────────────────────────────────────────
function ErrorTable({ data }: { data: A.RecentError[] }) {
  if (!data.length) return <EmptyState msg="Aucune erreur récente" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-3">Heure</th>
            <th className="text-left py-2 pr-3">Méthode</th>
            <th className="text-left py-2 pr-3">Path</th>
            <th className="text-left py-2 pr-3">Status</th>
            <th className="text-right py-2">ms</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 20).map((e, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
              <td className="py-1.5 pr-3 text-muted-foreground">{new Date(e.created_at).toLocaleTimeString('fr-FR')}</td>
              <td className="py-1.5 pr-3">
                <span className="font-mono px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    background: e.method === 'GET' ? `${C.blue}22` : e.method === 'POST' ? `${C.green}22` : `${C.amber}22`,
                    color: e.method === 'GET' ? C.blue : e.method === 'POST' ? C.green : C.amber,
                  }}>
                  {e.method}
                </span>
              </td>
              <td className="py-1.5 pr-3 font-mono max-w-[200px] truncate text-muted-foreground">{e.path}</td>
              <td className="py-1.5 pr-3">
                <span className="font-mono px-1.5 py-0.5 rounded text-[10px]"
                  style={{ background: `${C.red}22`, color: C.red }}>
                  {e.status_code}
                </span>
              </td>
              <td className="py-1.5 text-right text-muted-foreground">{e.response_ms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type TabKey = 'overview' | 'activite' | 'contenu' | 'geo' | 'performance' | 'erreurs';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview',     label: 'Vue d\'ensemble', icon: <Activity size={14} /> },
  { key: 'activite',     label: 'Activité',         icon: <TrendingUp size={14} /> },
  { key: 'contenu',      label: 'Contenu',           icon: <Download size={14} /> },
  { key: 'geo',          label: 'Géographie',        icon: <Globe size={14} /> },
  { key: 'performance',  label: 'Performance',       icon: <Zap size={14} /> },
  { key: 'erreurs',      label: 'Erreurs',           icon: <AlertTriangle size={14} /> },
];

export default function AdminStats() {
  const qc = useQueryClient();
  const [tab, setTab]     = useState<TabKey>('overview');
  const [period, setPeriod] = useState<'7j' | '30j' | '90j'>('30j');
  const days = TAB_DAYS[period];

  // ── Queries ──────────────────────────────────────────────────────────────
  const overview    = useQuery({ queryKey: ['an/overview'],            queryFn: A.getOverview,               staleTime: 30_000 });
  const dlSeries    = useQuery({ queryKey: ['an/dl-series', days],     queryFn: () => A.getDownloadSeries(days), staleTime: 120_000 });
  const actSeries   = useQuery({ queryKey: ['an/act-series', days],    queryFn: () => A.getActivitySeries(days), staleTime: 120_000 });
  const signSeries  = useQuery({ queryKey: ['an/sign-series', days],   queryFn: () => A.getSignupSeries(days),   staleTime: 120_000 });
  const topDepots   = useQuery({ queryKey: ['an/top-depots', days],    queryFn: () => A.getTopDepots(10, days),  staleTime: 120_000 });
  const topArticles = useQuery({ queryKey: ['an/top-articles', days],  queryFn: () => A.getTopArticles(10, days), staleTime: 120_000 });
  const geo         = useQuery({ queryKey: ['an/geo', days],           queryFn: () => A.getGeography(days),      staleTime: 300_000 });
  const heatmap     = useQuery({ queryKey: ['an/heatmap', days],       queryFn: () => A.getActivityHeatmap(days), staleTime: 300_000 });
  const perf        = useQuery({ queryKey: ['an/perf'],                queryFn: () => A.getAPIPerformance(24),   staleTime: 60_000 });
  const errRate     = useQuery({ queryKey: ['an/err-rate'],            queryFn: () => A.getErrorRate(24),        staleTime: 30_000 });
  const errRecent   = useQuery({ queryKey: ['an/err-recent'],          queryFn: () => A.getRecentErrors(50),     staleTime: 30_000 });
  const funnel      = useQuery({ queryKey: ['an/funnel'],              queryFn: A.getUserFunnel,                 staleTime: 300_000 });

  const flushMut = useMutation({
    mutationFn: () => A.flushCache(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['an/'] }),
  });

  const kpi = overview.data;
  const funnelData = funnel.data ? [
    { name: 'Inscriptions', value: Number(funnel.data.signups)     || 0, fill: C.blue },
    { name: 'Connexions',   value: Number(funnel.data.logins)      || 0, fill: C.purple },
    { name: 'Uploads',      value: Number(funnel.data.uploaders)   || 0, fill: C.green },
    { name: 'Télécharg.',   value: Number(funnel.data.downloaders) || 0, fill: C.amber },
  ] : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Métriques temps réel de la plateforme — calculées à la demande"
        action={
          <button
            onClick={() => flushMut.mutate()}
            disabled={flushMut.isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted/40 transition text-muted-foreground"
          >
            <RefreshCw size={12} className={flushMut.isPending ? 'animate-spin' : ''} />
            Vider le cache
          </button>
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border">
          {(['7j', '30j', '90j'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1 text-xs rounded-md transition font-medium"
              style={{
                background: period === p ? 'hsl(var(--card))' : 'transparent',
                color: period === p ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: period === p ? '0 1px 3px rgba(0,0,0,.15)' : 'none',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px"
            style={{
              borderColor: tab === t.key ? C.gold : 'transparent',
              color: tab === t.key ? C.gold : 'hsl(var(--muted-foreground))',
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Téléchargements 24h"
              value={kpi?.downloads24h ?? '—'}
              delta={kpi?.downloads24hDelta}
              icon={<Download size={16} />}
              color={C.blue}
              loading={overview.isLoading}
            />
            <KpiCard
              label="Utilisateurs actifs 24h"
              value={kpi?.activeUsers24h ?? '—'}
              icon={<Users size={16} />}
              color={C.green}
              loading={overview.isLoading}
            />
            <KpiCard
              label="Nouvelles inscriptions 7j"
              value={kpi?.newSignups7d ?? '—'}
              delta={kpi?.newSignups7dDelta}
              icon={<TrendingUp size={16} />}
              color={C.purple}
              loading={overview.isLoading}
            />
            <KpiCard
              label="Erreurs (1h)"
              value={kpi?.errorsCount1h ?? '—'}
              icon={<AlertTriangle size={16} />}
              color={kpi?.errorsCount1h ? C.red : C.muted}
              loading={overview.isLoading}
            />
          </div>

          {/* Funnel + error rate */}
          <div className="grid md:grid-cols-2 gap-4">
            <SectionCard title="Funnel utilisateur (30j)">
              {funnel.isLoading ? <ChartSkeleton /> :
               funnelData.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <FunnelChart>
                    <Tooltip formatter={(v) => [v, '']} />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="center" fill="#fff" fontSize={11}
                        formatter={(value: any) => String(value ?? '')} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
               ) : <EmptyState />}
            </SectionCard>

            <SectionCard title="Taux d'erreur (24h)">
              {errRate.isLoading ? <ChartSkeleton h={100} /> : errRate.data ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold" style={{ color: errRate.data.error_rate > 5 ? C.red : C.green }}>
                      {errRate.data.error_rate}%
                    </span>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{errRate.data.http_errors} erreurs HTTP 4xx</div>
                      <div>{errRate.data.total_requests} requêtes totales</div>
                      <div>{errRate.data.errors} événements erreur</div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(errRate.data.error_rate, 100)}%`,
                        background: errRate.data.error_rate > 5 ? C.red : C.green,
                      }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {errRate.data.error_rate <= 1 ? '✓ Excellent' :
                     errRate.data.error_rate <= 5 ? '⚠ Acceptable' : '✕ Attention requise'}
                  </p>
                </div>
              ) : <EmptyState />}
            </SectionCard>
          </div>
        </div>
      )}

      {/* ── Activité ─────────────────────────────────────────────────── */}
      {tab === 'activite' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <SectionCard title={`Téléchargements — ${period}`}>
              {dlSeries.isLoading ? <ChartSkeleton /> :
               dlSeries.data?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dlSeries.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 20%)" />
                    <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip labelFormatter={v => `Jour: ${v}`} />
                    <Line type="monotone" dataKey="count" stroke={C.blue} strokeWidth={2} dot={false} name="Téléchargements" />
                  </LineChart>
                </ResponsiveContainer>
               ) : <EmptyState />}
            </SectionCard>

            <SectionCard title={`Inscriptions — ${period}`}>
              {signSeries.isLoading ? <ChartSkeleton /> :
               signSeries.data?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={signSeries.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 20%)" />
                    <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip labelFormatter={v => `Jour: ${v}`} />
                    <Line type="monotone" dataKey="count" stroke={C.purple} strokeWidth={2} dot={false} name="Inscriptions" />
                  </LineChart>
                </ResponsiveContainer>
               ) : <EmptyState />}
            </SectionCard>
          </div>

          <SectionCard title={`Activité globale — ${period}`}>
            {actSeries.isLoading ? <ChartSkeleton h={180} /> :
             actSeries.data?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={actSeries.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 20%)" />
                  <XAxis dataKey="day" tickFormatter={fmtDay} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip labelFormatter={v => `Jour: ${v}`} />
                  <Bar dataKey="count" fill={C.cyan} radius={[3, 3, 0, 0]} name="Événements" />
                </BarChart>
              </ResponsiveContainer>
             ) : <EmptyState />}
          </SectionCard>

          <SectionCard title="Heatmap d'activité horaire">
            {heatmap.isLoading ? <ChartSkeleton h={130} /> :
              <ActivityHeatmap data={heatmap.data || []} />}
          </SectionCard>
        </div>
      )}

      {/* ── Contenu ───────────────────────────────────────────────────── */}
      {tab === 'contenu' && (
        <div className="grid md:grid-cols-2 gap-4">
          <SectionCard title={`Top dépôts téléchargés — ${period}`}>
            {topDepots.isLoading ? <ChartSkeleton h={200} /> :
             topDepots.data?.length ? (
              <div className="space-y-2">
                {topDepots.data.map((d, i) => (
                  <div key={d.depot_id} className="flex items-center gap-3 py-1">
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.unique_downloaders} dl uniques</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: C.blue }}>
                      <Download size={12} />
                      {d.download_count}
                    </div>
                  </div>
                ))}
              </div>
             ) : <EmptyState />}
          </SectionCard>

          <SectionCard title={`Top articles vus — ${period}`}>
            {topArticles.isLoading ? <ChartSkeleton h={200} /> :
             topArticles.data?.length ? (
              <div className="space-y-2">
                {topArticles.data.map((a, i) => (
                  <div key={a.article_id} className="flex items-center gap-3 py-1">
                    <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: C.purple }}>
                      <Activity size={12} />
                      {a.view_count}
                    </div>
                  </div>
                ))}
              </div>
             ) : <EmptyState />}
          </SectionCard>
        </div>
      )}

      {/* ── Géographie ────────────────────────────────────────────────── */}
      {tab === 'geo' && (
        <SectionCard title={`Répartition géographique — ${period}`}>
          {geo.isLoading ? <ChartSkeleton h={200} /> :
            <GeoTable data={geo.data || []} />}
        </SectionCard>
      )}

      {/* ── Performance ───────────────────────────────────────────────── */}
      {tab === 'performance' && (
        <div className="space-y-6">
          <SectionCard title="Temps de réponse API (24h) — p50 / p95 / p99">
            {perf.isLoading ? <ChartSkeleton h={240} /> :
             perf.data?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={perf.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 20%)" />
                  <XAxis dataKey="hour" tickFormatter={v => v?.slice(11, 16)} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="ms" />
                  <Tooltip formatter={(v, name) => [`${v}ms`, name]} labelFormatter={v => `Heure: ${String(v).slice(11, 16)}`} />
                  <Line type="monotone" dataKey="p50" stroke={C.green}  strokeWidth={2} dot={false} name="p50" />
                  <Line type="monotone" dataKey="p95" stroke={C.amber}  strokeWidth={2} dot={false} name="p95" />
                  <Line type="monotone" dataKey="p99" stroke={C.red}    strokeWidth={2} dot={false} name="p99" />
                </LineChart>
              </ResponsiveContainer>
             ) : <EmptyState msg="Aucune donnée de performance (nécessite des événements api_request)" />}
          </SectionCard>

          {perf.data?.length ? (
            <div className="grid grid-cols-3 gap-4">
              {['p50', 'p95', 'p99'].map((p, i) => {
                const last = perf.data![perf.data!.length - 1];
                const val = last?.[p as keyof A.PerfHour] as number;
                const colors = [C.green, C.amber, C.red];
                return (
                  <div key={p} className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{p}</p>
                    <p className="text-2xl font-bold" style={{ color: colors[i] }}>
                      {val != null ? `${Math.round(val)}ms` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">dernière heure</p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {/* ── Erreurs ───────────────────────────────────────────────────── */}
      {tab === 'erreurs' && (
        <div className="space-y-6">
          {errRate.data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Taux d'erreur" value={`${errRate.data.error_rate}%`}
                icon={<AlertTriangle size={16} />} color={errRate.data.error_rate > 5 ? C.red : C.green} />
              <KpiCard label="Erreurs HTTP 4xx" value={errRate.data.http_errors}
                icon={<AlertTriangle size={16} />} color={C.amber} />
              <KpiCard label="Requêtes totales" value={errRate.data.total_requests}
                icon={<Activity size={16} />} color={C.blue} />
              <KpiCard label="Événements erreur" value={errRate.data.errors}
                icon={<AlertTriangle size={16} />} color={C.red} />
            </div>
          )}
          <SectionCard title="Erreurs récentes (HTTP ≥ 400)">
            {errRecent.isLoading ? <ChartSkeleton h={160} /> :
              <ErrorTable data={errRecent.data || []} />}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
