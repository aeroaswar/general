import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layers, Target, Users, Megaphone, FolderKanban, ArrowUpRight, Compass } from "lucide-react";
import { useData, useVisibleProjects, useActiveProject, useProjectContent } from "../store.jsx";
import { PROJECT_STATUS_C, BOARD_COLUMNS, STATUS_META, fmtDate } from "../lib/status.js";
import { Card, Badge, Progress, PageTitle, PlatformTag, EmptyState, fadeUp, cx } from "../lib/ui.jsx";

// The Project hub — overview + framework (merged from the old Strategy page).
export default function Projects() {
  const projects = useVisibleProjects();
  const project = useActiveProject();
  const content = useProjectContent();
  const { phases, pillars, audienceSegments, selectedProjectId, setSelectedProjectId } = useData();

  const data = useMemo(() => {
    if (!project) return null;
    const items = content;
    const total = items.length || 1;
    return {
      phases: phases.filter((x) => x.projectId === project.id).sort((a, b) => a.order - b.order),
      pillars: pillars.filter((x) => x.projectId === project.id).map((pl) => ({ ...pl, actual: Math.round((items.filter((c) => c.pillarId === pl.id).length / total) * 100) })),
      segments: audienceSegments.filter((x) => x.projectId === project.id),
      counts: BOARD_COLUMNS.map((s) => ({ s, n: items.filter((c) => c.status === s).length })).filter((x) => x.n),
    };
  }, [project, phases, pillars, audienceSegments, content]);

  if (!project) return <EmptyState icon={FolderKanban} title="No projects" sub="This client has no projects yet." />;

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Project" title={project.name}>
        <Badge color={PROJECT_STATUS_C[project.status]}>{project.status}</Badge>
      </PageTitle>

      {/* project switcher */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
              className={cx("chip", p.id === selectedProjectId && "!border-transparent")}
              style={p.id === selectedProjectId ? { background: "#e8743b1a", color: "#e8743b", borderColor: "#e8743b88" } : { color: "var(--muted)" }}>
              <i className="w-1.5 h-1.5 rounded-full" style={{ background: PROJECT_STATUS_C[p.status] }} />{p.name}
            </button>
          ))}
        </div>
      )}

      {/* overview */}
      <Card className="mb-4">
        <div className="grid sm:grid-cols-4 gap-4">
          <Meta label="Industry" value={project.industry} />
          <Meta label="Cadence" value={project.cadence} />
          <Meta label="Timeline" value={`${fmtDate(project.startDate)} – ${fmtDate(project.endDate)}`} />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-faint mb-1.5">Health</p>
            <div className="flex items-center gap-2"><div className="flex-1"><Progress value={project.health} /></div><span className="text-sm font-semibold tabular-nums">{project.health}</span></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-5 border-t hairline">
          <Meta label="Business goal" value={project.goalBusiness} />
          <Meta label="Marketing goal" value={project.goalMarketing} />
          <Meta label="Campaign goal" value={project.goalCampaign} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">{project.platforms.map((p) => <PlatformTag key={p} platform={p} />)}</div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* phases */}
        <Card>
          <h3 className="display font-bold mb-4 flex items-center gap-2"><Layers size={17} className="text-accent" /> Framework — phases</h3>
          <div className="relative pl-6">
            <span className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: "var(--line-2)" }} />
            <div className="flex flex-col gap-5">
              {data.phases.map((ph) => (
                <div key={ph.id} className="relative">
                  <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2" style={{ background: "var(--card)", borderColor: "#e8743b" }} />
                  <p className="font-semibold">{ph.name}</p>
                  <p className="text-sm text-muted">{ph.objective}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* pillars target vs actual */}
        <Card>
          <h3 className="display font-bold mb-4 flex items-center gap-2"><Megaphone size={17} className="text-accent" /> Pillars — target vs actual</h3>
          <div className="flex flex-col gap-4">
            {data.pillars.map((pl) => (
              <div key={pl.id}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{pl.name}</span><span className="text-muted">target {pl.weight}% · actual {pl.actual}%</span></div>
                <div className="relative">
                  <Progress value={pl.actual} color="linear-gradient(90deg,#e8743b,#f0a35e)" />
                  <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-[color:var(--text)]" style={{ left: `${pl.weight}%` }} title={`target ${pl.weight}%`} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-faint mt-4">Marker = planned weight; bar = what's actually in the pipeline.</p>
        </Card>
      </div>

      {/* audience + content summary */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <h3 className="display font-bold mb-3 flex items-center gap-2"><Users size={17} className="text-accent" /> Audience segments</h3>
          <div className="flex flex-col gap-3">
            {data.segments.map((s) => (
              <div key={s.id} className="glass-2 hairline border rounded-xl p-3"><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted">{s.description}</p></div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="display font-bold flex items-center gap-2"><Compass size={17} className="text-accent" /> Content in pipeline</h3>
            <Link href="/app/content" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Open board <ArrowUpRight size={15} /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.counts.length === 0 && <span className="text-sm text-muted">No content yet.</span>}
            {data.counts.map(({ s, n }) => (
              <span key={s} className="chip" style={{ color: STATUS_META[s].c }}><i className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[s].c }} />{STATUS_META[s].label} · {n}</span>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function Meta({ label, value }) {
  return (
    <div><p className="text-[11px] uppercase tracking-wider text-faint mb-1.5">{label}</p><div className="text-sm font-medium">{value}</div></div>
  );
}
