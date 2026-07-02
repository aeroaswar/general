import { PageTitle, Card, Badge, Progress } from "../ui.jsx";
import { PROJECT_STATUS_C, STAGES, fmtDate } from "../status.js";
import { useData, useActiveProject, useProjectContent } from "../store.jsx";

export default function Project() {
  const { store } = useData();
  const project = useActiveProject();
  const content = useProjectContent();
  if (!project) return <PageTitle title="No project selected" />;

  const campaigns = store.campaigns.filter((c) => c.projectId === project.id);
  const done = content.filter((c) => ["Posted", "Archived"].includes(c.status)).length;

  return (
    <>
      <PageTitle kicker="Framework" title={project.name}>
        <Badge color={PROJECT_STATUS_C[project.status]}>{project.status}</Badge>
      </PageTitle>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <p className="eyebrow mb-3">Phases</p>
          <ol className="flex flex-col gap-2">
            {project.phases.map((ph, i) => (
              <li key={ph} className="flex items-center gap-3 text-sm">
                <span className="mono text-xs text-faint w-5">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{ph}</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <p className="eyebrow mb-3">Content pillars</p>
          <div className="flex flex-wrap gap-2">
            {project.pillars.map((p) => <span key={p} className="chip">{p}</span>)}
          </div>
          <p className="eyebrow mt-5 mb-3">Audience segments</p>
          <div className="flex flex-wrap gap-2">
            {project.segments.map((s) => <span key={s} className="chip" style={{ color: "var(--accent)" }}>{s}</span>)}
          </div>
        </Card>
        <Card>
          <p className="eyebrow mb-3">Delivery</p>
          <p className="display text-4xl font-semibold grad-text">{content.length ? Math.round((done / content.length) * 100) : 0}%</p>
          <p className="text-xs text-muted mb-3">{done} of {content.length} items live or archived</p>
          <Progress value={content.length ? (done / content.length) * 100 : 0} />
          <p className="text-xs text-faint mono mt-4">{fmtDate(project.start, "MMM d, yyyy")} → {fmtDate(project.end, "MMM d, yyyy")}</p>
        </Card>
      </div>

      <Card>
        <p className="eyebrow mb-4">Campaigns</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {campaigns.map((c) => {
            const items = content.filter((x) => x.campaignId === c.id);
            return (
              <div key={c.id} className="glass-2 hairline border rounded-brand p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted mt-1">{c.goal}</p>
                <div className="flex items-center justify-between text-xs mono text-faint mt-3">
                  <span>{fmtDate(c.start)} → {fmtDate(c.end)}</span>
                  <span>{items.length} items</span>
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && <p className="text-sm text-muted">No campaigns yet.</p>}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="eyebrow mb-3">Flow</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {STAGES.map((s, i) => (
            <span key={s.key} className="flex items-center gap-2">
              <span className="chip" style={{ color: s.c }}>{s.label}</span>
              {i < STAGES.length - 1 && <span className="text-faint">→</span>}
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}
