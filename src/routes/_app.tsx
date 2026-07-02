import { createFileRoute, Outlet, Navigate, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, Zap, MoonStar, SunMedium, Menu, X, CheckSquare2, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_app")({ component: AppLayout });

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/leads/new", label: "Add Lead", icon: UserPlus },
  { to: "/tasks", label: "Tasks", icon: CheckSquare2 },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#071114] text-slate-300">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  const activeFor = (itemTo: string) =>
    location.pathname === itemTo || (itemTo === "/leads" && location.pathname.startsWith("/leads") && location.pathname !== "/leads/new");

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border bg-card/90 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#21c7b6] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_40px_rgba(33,199,182,0.25)]">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-foreground">Apex CRM</p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Pipeline command center</p>
          </div>
        </div>
        <Separator className="bg-border" />
        <div className="flex-1 px-3 py-4">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Navigation</p>
          <nav className="space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = activeFor(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all",
                    active ? "bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="mb-2 w-full justify-start gap-3 rounded-xl border border-border bg-background/60 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {theme === "dark" ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 rounded-xl border border-border bg-background/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="size-4" />
            Logout
          </Button>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-3 py-3">
            <Avatar className="size-9 border border-border bg-[#1b2d2f] text-white">
              <AvatarFallback className="bg-transparent text-xs font-semibold text-foreground">
                {user.email?.slice(0, 1).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Admin workspace</p>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center gap-3 px-5 py-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#21c7b6] text-white">
                <Zap className="size-5" />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-foreground">Apex CRM</p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Pipeline command center</p>
              </div>
            </div>
            <Separator className="bg-border" />
            <nav className="flex-1 space-y-1 px-3 py-4">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = activeFor(item.to);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
              <div className="border-t border-border p-4">
                <Button variant="ghost" size="sm" onClick={toggle} className="mb-2 w-full justify-start gap-3 rounded-xl border border-border bg-background/60 text-foreground hover:bg-accent hover:text-accent-foreground">
                {theme === "dark" ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-3 rounded-xl border border-border bg-background/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-card/70 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen((value) => !value)} className="rounded-xl border border-border bg-background/60 text-foreground hover:bg-accent hover:text-accent-foreground">
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            <div>
                <p className="text-sm font-semibold text-foreground">Apex CRM</p>
                <p className="text-[11px] text-muted-foreground">Pipeline command center</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
              <p className="text-sm text-muted-foreground">Welcome back, {user.email?.split("@")[0] ?? "Bhanu"}</p>
          </div>
          <div className="flex items-center gap-3">
              <button type="button" onClick={toggle} aria-label="Toggle theme" className="flex size-10 items-center justify-center rounded-full border border-border bg-background/60 text-foreground hover:bg-accent hover:text-accent-foreground">
              {theme === "dark" ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
            </button>
              <Avatar className="size-10 border border-border bg-[#153237] text-white">
                <AvatarFallback className="bg-transparent text-sm font-semibold text-foreground">
                {user.email?.slice(0, 1).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
