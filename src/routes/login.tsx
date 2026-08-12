import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/app-context";
import { useI18n } from "@/lib/i18n";
import type { Role } from "@/lib/mock-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — DEMO Operations Analytics" },
      {
        name: "description",
        content:
          "Secure access to the DEMO glass container manufacturing analytics platform.",
      },
      { property: "og:title", content: "Sign in — DEMO Operations Analytics" },
      {
        property: "og:description",
        content: "Corporate access to supply, production, quality and sales dashboards.",
      },
    ],
  }),
  component: LoginPage,
});

const ROLES: Role[] = [
  "Administrator",
  "Production Supervisor",
  "Quality Analyst",
  "Executive",
];

function LoginPage() {
  const { signIn } = useApp();
  const { p, td } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("m.whitfield@demo.com");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("Administrator");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div
        className="relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex"
        style={{ backgroundImage: "var(--gradient-brand)" }}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-white/15">
            <PanelsTopLeft className="size-5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-widest">DEMO</p>
            <p className="text-[11px] opacity-70">{p("login.brandSub")}</p>
          </div>
        </div>
        <div className="max-w-lg">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            {p("login.heroTitle")}
          </h1>
          <p className="mt-4 text-sm opacity-80">
            {p("login.heroBody")}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-6 border-t border-white/15 pt-6 text-sm">
          {[
            ["3", p("login.statLines")],
            [p("login.statHistoryValue"), p("login.statHistory")],
            ["4", p("login.statDomains")],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="font-display text-2xl font-semibold">{v}</dt>
              <dd className="text-[11px] uppercase tracking-widest opacity-70">{l}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-16">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            signIn(email, role);
            void navigate({ to: "/" });
          }}
        >
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {p("login.signIn")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {p("login.signInSub")}
          </p>

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{p("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{p("login.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{p("login.role")}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {td(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {p("login.roleNote")}
              </p>
            </div>
          </div>

          <Button type="submit" className="mt-8 w-full gap-2">
            <Lock className="size-4" /> {p("login.submit")}
          </Button>
        </form>
      </div>
    </div>
  );
}
