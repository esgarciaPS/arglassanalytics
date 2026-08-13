import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  ChevronDown,
  Factory,
  Globe,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", key: "executive", icon: LayoutDashboard, exact: true },
  { to: "/supply", key: "supply", icon: Boxes },
  { to: "/production", key: "production", icon: Factory },
  { to: "/quality", key: "quality", icon: ShieldCheck },
  { to: "/distribution", key: "distribution", icon: Truck },
  { to: "/manual", key: "manual", icon: BookOpen },
] as const;

const ADMIN_NAV = [
  { to: "/admin/targets", key: "targets", icon: SlidersHorizontal },
  { to: "/admin/users", key: "users", icon: Users },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, ready, signOut, search, setSearch } = useApp();
  const { t, td, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);


  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!session) {
    if (typeof window !== "undefined") {
      void navigate({ to: "/login", replace: true });
    }
    return <div className="min-h-screen bg-background" />;
  }

  const isAdmin = session.role === "Administrator";
  const allowed: Record<string, string[]> = {
    Administrator: ["/", "/supply", "/production", "/quality", "/distribution", "/manual"],
    "Production Supervisor": ["/", "/supply", "/production", "/manual"],
    "Quality Analyst": ["/", "/quality", "/production", "/manual"],
    Executive: ["/", "/supply", "/production", "/quality", "/distribution", "/manual"],
  };
  const visibleNav = NAV.filter((item) =>
    (allowed[session.role] ?? ["/"]).includes(item.to),
  );

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  const sidebar = (
    <>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
            <PanelsTopLeft className="size-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight">
                DEMO
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">
                Operations Analytics
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" onClick={() => setMobileOpen(false)}>

          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive(item.to, "exact" in item ? item.exact : false)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              title={t(`nav.${item.key}`)}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
            </Link>
          ))}

          {isAdmin && (
            <div className="pt-3">
              {!collapsed && (
                <button
                  onClick={() => setAdminOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 hover:text-sidebar-foreground"
                >
                  {t("nav.administration")}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      !adminOpen && "-rotate-90",
                    )}
                  />
                </button>
              )}
              {(adminOpen || collapsed) &&
                ADMIN_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive(item.to)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                    title={t(`nav.${item.key}`)}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{t(`nav.${item.key}`)}</span>}
                  </Link>
                ))}
            </div>
          )}
        </nav>

        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <Menu className="size-4" />
            {!collapsed && <span>{t("ui.collapse")}</span>}
          </button>
        </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:flex",
          collapsed ? "w-16" : "w-68",
        )}
      >
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-68 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card px-3 sm:gap-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="hidden text-sm font-semibold text-foreground xl:block">
            {t("ui.platform")}
          </div>
          <div className="relative mx-auto w-full min-w-0 max-w-xl">

            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("ui.search")}
              className="h-10 pl-9"
              aria-label="Global search"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 px-2" aria-label={t("ui.language")}>
                <Globe className="size-4" />
                <span className="text-xs font-semibold">
                  {lang.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("ui.language")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={l.code === lang ? "font-semibold text-foreground" : ""}
                >
                  <span className="mr-2 text-[11px] text-muted-foreground">{l.flag}</span>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 shrink-0 gap-3 px-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {session.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-left leading-tight lg:block">

                  <span className="block text-sm font-medium">{session.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {td(session.role)}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {session.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  void navigate({ to: "/login", replace: true });
                }}
              >
                <LogOut className="mr-2 size-4" /> {t("ui.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
