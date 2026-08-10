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
import { users as seedUsers, type AppUser, type Role } from "@/lib/mock-data";
import { RestrictedNotice } from "./admin.targets";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users & Roles — Arglass Administration" },
      {
        name: "description",
        content:
          "Manage platform users and assign roles: Administrator, Production Supervisor, Quality Analyst and Executive.",
      },
      { property: "og:title", content: "Users & Roles — Arglass Administration" },
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

const ROLE_SCOPE: Record<Role, string> = {
  Administrator: "All modules + administration",
  "Production Supervisor": "Supply, Production",
  "Quality Analyst": "Quality, Production (read)",
  Executive: "All dashboards — read only",
};

function UsersPage() {
  const { search, session } = useApp();
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
        title="Users & Roles"
        description="Directory of platform accounts and the role that determines which operational modules each user can access."
        fileName="arglass-users"
        filterSummary={search ? `Search: "${search}"` : "No filters applied"}
        sections={() => [
          {
            title: "Users",
            columns: ["ID", "Name", "Email", "Role", "Module scope", "Status"],
            rows: filtered.map((u) => [
              u.id,
              u.name,
              u.email,
              u.role,
              ROLE_SCOPE[u.role],
              u.status,
            ]),
          },
        ]}
      />

      <Panel title="Platform users" subtitle={`${filtered.length} account(s)`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-64">Role</TableHead>
              <TableHead>Module scope</TableHead>
              <TableHead>Status</TableHead>
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
                      toast.success(`${u.name} reassigned to ${v}`);
                    }}
                  >
                    <SelectTrigger className="h-9" aria-label={`Role for ${u.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">{ROLE_SCOPE[u.role]}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={u.status === "Active" ? "ok" : "warning"}
                    label={u.status}
                  />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No users match the current search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Panel>
    </AppShell>
  );
}
