import { ListTodo } from "lucide-react";
import { PageTitle, Card, StatusBadge, PlatformTag, EmptyState } from "../ui.jsx";
import { fmtDate } from "../status.js";
import { useAuth, useData } from "../store.jsx";

// Everything assigned to me that isn't live yet, ordered by deadline.
export default function Queue() {
  const { me } = useAuth();
  const { store } = useData();
  const mine = store.content
    .filter((c) => (me.role === "admin" ? true : c.ownerId === me.id))
    .filter((c) => !["Posted", "Archived"].includes(c.status))
    .sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));

  return (
    <>
      <PageTitle kicker={me.role === "admin" ? "Studio-wide" : "Assigned to you"} title="My Queue" />
      {mine.length === 0 ? (
        <EmptyState icon={ListTodo} title="Queue is clear" sub="Nothing assigned right now." />
      ) : (
        <div className="flex flex-col gap-2">
          {mine.map((c) => {
            const project = store.projects.find((p) => p.id === c.projectId);
            return (
              <Card key={c.id} className="!p-4 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{c.title}</p>
                  <p className="text-xs text-muted mt-0.5">{project?.name}</p>
                </div>
                <StatusBadge status={c.status} />
                <PlatformTag platform={c.platform} />
                <span className="mono text-xs text-faint w-20 text-right">{c.deadline ? fmtDate(c.deadline) : "—"}</span>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
