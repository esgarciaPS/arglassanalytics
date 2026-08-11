import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "Platform Manual — DEMO Operations Analytics" },
      {
        name: "description",
        content:
          "Detailed manual of the DEMO glass container operations analytics platform: modules, datasets, indicators and how each measurement is calculated.",
      },
      { property: "og:title", content: "Platform Manual — DEMO Operations Analytics" },
      {
        property: "og:description",
        content:
          "How every dashboard, dataset and indicator of the operations analytics platform works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManualPage,
});

function ManualPage() {
  const { d } = useI18n();
  const m = d.manual;

  return (
    <AppShell>
      <div className="mb-6 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <BookOpen className="size-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">{m.title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{m.description}</p>
        </div>
      </div>

      <div className="card-surface mb-6 p-5">
        <p className="max-w-4xl text-sm leading-relaxed text-foreground">{m.intro}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {m.sections.map((section) => (
          <section key={section.heading} className="card-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
            <ul className="mt-3 space-y-2">
              {section.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
