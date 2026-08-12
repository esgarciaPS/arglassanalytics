import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Panel } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { matchesSearch, useApp } from "@/lib/app-context";
import { useI18n } from "@/lib/i18n";
import { users as seedUsers, type AppUser, type Role } from "@/lib/mock-data";
import { RestrictedNotice } from "./admin.targets";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — DEMO Administration" },
      {
        name: "description",
        content:
          "Manage platform users and assign roles: Administrator, Production Supervisor, Quality Analyst and Executive.",
      },
      { property: "og:title", content: "Users & Roles — DEMO Administration" },
      {
        property: "og:description",
        content: "User directory and role assignment for the operations analytics platform.",
      },
    ],
  }),
  component: UsersPage,
});

const ROLES: Role[] = [
  "Administrator",
  "Production Supervisor",
  "Quality Analyst",
  "Executive",
];

const ROLE_SCOPE_KEY: Record<Role, string> = {
  Administrator: "users.scopeAdministrator",
  "Production Supervisor": "users.scopeSupervisor",
  "Quality Analyst": "users.scopeQuality",
  Executive: "users.scopeExecutive",
};

function UsersPage() {
  const { search, session } = useApp();
  const { p, td } = useI18n();
  const [list, setList] = useState<AppUser[]>(seedUsers);

  const filtered = useMemo(
    () => list.filter((u) => matchesSearch(search, u.name, u.email, u.role, u.status)),
    [list, search],
  );

  if (session?.role !== "Administrator") {
    return (
      <AppShell>
        <RestrictedNotice />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        legendModule="users"
        title={p("users.title")}
        description={p("users.desc")}
        fileName="demo-users"
        filterSummary={search ? `${p("common.search")}: "${search}"` : p("common.noFilters")}
        sections={() => [
          {
            title: p("users.secUsers"),
            columns: [
              "ID",
              p("users.colUser"),
              p("users.colEmail"),
              p("users.colRole"),
              p("users.colScope"),
              p("common.status"),
            ],
            rows: filtered.map((u) => [
              u.id,
              u.name,
              u.email,
              td(u.role),
              p(ROLE_SCOPE_KEY[u.role]),
              td(u.status),
            ]),
          },
        ]}
      />

      <Panel title={p("users.tableTitle")} subtitle={p("users.tableSub", { n: filtered.length })}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{p("users.colUser")}</TableHead>
              <TableHead>{p("users.colEmail")}</TableHead>
              <TableHead className="w-64">{p("users.colRole")}</TableHead>
              <TableHead>{p("users.colScope")}</TableHead>
              <TableHead>{p("common.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onValueChange={(v) => {
                      setList((prev) =>
                        prev.map((x) => (x.id === u.id ? { ...x, role: v as Role } : x)),
                      );
                      toast.success(p("users.reassigned", { name: u.name, role: td(v) }));
                    }}
                  >
                    <SelectTrigger className="h-9" aria-label={`Role for ${u.name}`}>
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
                </TableCell>
                <TableCell className="text-muted-foreground">{p(ROLE_SCOPE_KEY[u.role])}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={u.status === "Active" ? "ok" : "warning"}
                    label={td(u.status)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {p("users.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Panel>
    </AppShell>
  );
}
