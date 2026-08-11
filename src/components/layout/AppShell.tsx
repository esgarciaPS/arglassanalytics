import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  ChevronDown,
  Factory,
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
  { to: "/", label: "Executive Panel", icon: LayoutDashboard, exact: true },
  { to: "/supply", label: "Supply & Raw Materials", icon: Boxes },
  { to: "/production", label: "Production", icon: Factory },
  { to: "/quality", label: "Quality & Positive Release", icon: ShieldCheck },
  { to: "/distribution", label: "Distribution & Sales", icon: Truck },
] as const;

const ADMIN_NAV = [
  { to: "/admin/targets", label: "Target Configuration", icon: SlidersHorizontal },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, ready, signOut, search, setSearch } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);

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
    Administrator: ["/", "/supply", "/production", "/quality", "/distribution"],
    "Production Supervisor": ["/", "/supply", "/production"],
    "Quality Analyst": ["/", "/quality", "/production"],
    Executive: ["/", "/supply", "/production", "/quality", "/distribution"],
  };
  const visibleNav = NAV.filter((item) =>
    (allowed[session.role] ?? ["/"]).includes(item.to),
  );

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
          collapsed ? "w-16" : "w-68",
        )}
      >
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

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
              title={item.label}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}

          {isAdmin && (
            <div className="pt-3">
              {!collapsed && (
                <button
                  onClick={() => setAdminOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 hover:text-sidebar-foreground"
                >
                  Administration
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
                    title={item.label}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                ))}
            </div>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <Menu className="size-4" />
            {!collapsed && <span>Collapse menu</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          <div className="hidden text-sm font-semibold text-foreground md:block">
            DEMO Operations Intelligence
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search line, product, batch, raw material or period…"
              className="h-10 pl-9"
              aria-label="Global search"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-3 px-2">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {session.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-medium">{session.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {session.role}
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
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
