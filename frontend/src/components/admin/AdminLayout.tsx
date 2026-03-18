import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../ui/sidebar";
import {
  LogOut,
  Users,
  FolderOpen,
  Tag,
  Megaphone,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  ChevronRight,
  ArrowLeftFromLine,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { cn } from "@/lib/utils";

// ── Palette sidebar (hard-coded pour éviter les problèmes d'opacité) ──────
const S = {
  bg:          "hsl(222 47% 9%)",   // fond principal
  bgHeader:    "hsl(222 47% 7%)",   // header légèrement plus sombre
  bgAccent:    "hsl(222 40% 14%)",  // fond des items hover / user card
  bgActive:    "hsl(217 91% 60% / 0.14)",
  border:      "hsl(222 35% 17%)",

  textStrong:  "hsl(213 31% 92%)",  // texte principal — blanc chaud lisible
  textMuted:   "hsl(213 22% 62%)",  // texte secondaire — gris-bleu moyen
  textFaint:   "hsl(213 18% 48%)",  // labels de groupe — discret

  gold:        "hsl(43 74% 52%)",   // accent or
  goldFaint:   "hsl(43 60% 42%)",   // or atténué pour les labels

  primary:     "hsl(217 91% 65%)",  // bleu Griote actif
  primaryBg:   "hsl(217 91% 60% / 0.13)",
};

const menuGroups = [
  {
    groupLabel: "Vue d'ensemble",
    items: [
      { id: "stats", title: "Tableau de bord", icon: LayoutDashboard, path: "/admin/stats" },
    ],
  },
  {
    groupLabel: "Contenu",
    items: [
      { id: "announcements", title: "Annonces", icon: Megaphone, path: "/admin/announcements" },
      { id: "articles",      title: "Articles", icon: FileText,  path: "/admin/articles" },
      { id: "depots",        title: "Dépôts",   icon: Package,   path: "/admin/depots" },
    ],
  },
  {
    groupLabel: "Organisation",
    items: [
      { id: "users",      title: "Utilisateurs", icon: Users,      path: "/admin/users" },
      { id: "categories", title: "Catégories",   icon: FolderOpen, path: "/admin/categories" },
      { id: "tags",       title: "Tags",         icon: Tag,        path: "/admin/tags" },
    ],
  },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  const handleLogout = async () => {
    try { await logout(); } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
    navigate("/");
  };

  const getActiveItem = () => {
    for (const group of menuGroups) {
      const found = group.items.find(item => item.path === location.pathname);
      if (found) return found;
    }
    return null;
  };

  const activeItem = getActiveItem();
  const initials =
    user?.first_name?.charAt(0).toUpperCase() ||
    user?.last_name?.charAt(0).toUpperCase() ||
    "A";

  return (
    <SidebarProvider>

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}
      <Sidebar
        className="border-r-0"
        style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
      >

        {/* ── Header ───────────────────────────── */}
        <SidebarHeader
          className="px-0 py-0"
          style={{ background: S.bgHeader, borderBottom: `1px solid ${S.border}` }}
        >
          {/* Gold accent line */}
          <div
            className="h-[2px] w-full"
            style={{
              background: `linear-gradient(90deg, ${S.gold} 0%, hsl(38 80% 55%) 60%, transparent 100%)`,
            }}
          />

          <div className="flex items-center gap-3 px-4 py-3.5">
            {/* Home button */}
            <button
              onClick={() => navigate("/")}
              title="Retour à l'accueil"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{ background: S.bgAccent, color: S.textMuted }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = S.primaryBg;
                (e.currentTarget as HTMLButtonElement).style.color = S.primary;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = S.bgAccent;
                (e.currentTarget as HTMLButtonElement).style.color = S.textMuted;
              }}
            >
              <Home className="h-4 w-4" />
            </button>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight" style={{ color: S.textStrong }}>
                Administration
              </span>
              <span className="text-[10px] mt-0.5 font-medium tracking-widest uppercase" style={{ color: S.gold }}>
                Griote
              </span>
            </div>
          </div>
        </SidebarHeader>

        {/* ── Menu ─────────────────────────────── */}
        <SidebarContent className="py-3 px-0 sidebar-scrollbar">
          {menuGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex} className="mb-2 px-0">

              {/* Group label */}
              <SidebarGroupLabel
                className="px-5 pb-1.5 pt-0 text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ color: S.goldFaint }}
              >
                {group.groupLabel}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.path}
                            onClick={(e) => { e.preventDefault(); navigate(item.path); }}
                            className={cn(
                              "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                            )}
                            style={isActive ? {
                              background: S.bgActive,
                              color: S.primary,
                              borderLeft: `2px solid ${S.primary}`,
                              paddingLeft: "10px",
                            } : {
                              color: S.textStrong,
                              borderLeft: "2px solid transparent",
                            }}
                            onMouseEnter={e => {
                              if (!isActive) {
                                (e.currentTarget as HTMLAnchorElement).style.background = S.bgAccent;
                                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isActive) {
                                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                                (e.currentTarget as HTMLAnchorElement).style.color = S.textStrong;
                              }
                            }}
                          >
                            <item.icon
                              className="h-4 w-4 shrink-0"
                              style={{ color: isActive ? S.primary : S.textMuted }}
                            />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* ── Footer (user + logout) ────────────── */}
        <SidebarFooter
          className="p-3"
          style={{ borderTop: `1px solid ${S.border}` }}
        >
          {/* User card */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
            style={{ background: S.bgAccent }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: S.primary, color: "#fff" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: S.textStrong }}>
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.email || "Admin"}
              </p>
              <p className="text-xs truncate" style={{ color: S.textMuted }}>
                {user?.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
              </p>
            </div>
          </div>

          {/* Espace utilisateur */}
          <SidebarMenu className="mb-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate("/depots")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: S.gold,
                  background: "hsl(43 74% 49% / 0.08)",
                  border: "1px solid hsl(43 74% 49% / 0.18)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(43 74% 49% / 0.15)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(43 74% 49% / 0.35)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(43 74% 49% / 0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(43 74% 49% / 0.18)";
                }}
              >
                <ArrowLeftFromLine className="h-4 w-4 shrink-0" />
                <span>Espace utilisateur</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Logout */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ color: S.textMuted }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = "hsl(0 75% 65%)";
                  (e.currentTarget as HTMLButtonElement).style.background = "hsl(0 80% 50% / 0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = S.textMuted;
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <SidebarInset className="flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6">
          <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Admin</span>
            {activeItem && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="font-semibold text-foreground">{activeItem.title}</span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
