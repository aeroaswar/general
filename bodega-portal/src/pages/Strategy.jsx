import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Megaphone, Users, Compass } from "lucide-react";
import { useData, useVisibleProjects } from "../store.jsx";
import { Card, Progress, PageTitle, EmptyState, PlatformTag, fadeUp } from "../lib/ui.jsx";

export default function Strategy() {
  const projects = useVisibleProjects();
  const { phases, pillars, audienceSegments, contentItems } = useData();
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const project = projects.find((p) => p.id === projectId) || projects[0];

  const data = useMemo(() => {
    if (!project) return null;
    const pPhases = phases.filter((x) => x.projectId === project.id).sort((a, b) => a.order - b.order);
    const pPillars = pillars.filter((x) => x.projectId === project.id);
    const pSegs = audienceSegments.filter((x) => x.projectId === project.id);
    const items = contentItems.filter((c) => c.projectId === project.id);
    const total = items.length || 1;
    const actual = Object.fromEntries(pPillars.map((pl) => [pl.id, Math.round((items.filter((c) => c.pillarId === pl.id).length / total) * 100)]));
    return { pPhases, pPillars, pSegs, actual };
  }, [project, phases, pillars, audienceSegments, contentItems]);

  if (!project) return <EmptyState icon={Compass} title="No project" sub="Select a client with projects." />;

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Framework" title="Strategy">
        <select className="input-glass !w-auto !py-1.5" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </PageTitle>

      {/* overview */}
      <Card className="mb-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Meta label="Cadence" value={project.cadence} />
          <Meta label="Platforms" value={<div className="flex flex-wrap gap-1.5">{project.platforms.map((p) => <PlatformTag key={p} platform={p} />)}</div>} />
          <Meta label="Campaign goal" value={project.goalCampaign} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* phases */}
        <Card>
          <h3 className="display font-bold mb-4 flex items-center gap-2"><Layers size={17} className="text-accent" /> Phases</h3>
          <div className="relative pl-6">
            <span className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: "var(--line-2)" }} />
            <div className="flex flex-col gap-5">
              {data.pPhases.map((ph) => (
                <div key={ph.id} className="relative">
                  <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2" style={{ background: "var(--bg)", borderColor: "#2562e7" }} />
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
            {data.pPillars.map((pl) => (
              <div key={pl.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{pl.name}</span>
                  <span className="text-muted">target {pl.weight}% · actual {data.actual[pl.id]}%</span>
                </div>
                <div className="relative">
                  <Progress value={data.actual[pl.id]} color="linear-gradient(90deg,#2562e7,#01dcb4)" />
                  <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-[color:var(--text)]" style={{ left: `${pl.weight}%` }} title={`target ${pl.weight}%`} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-faint mt-4">The marker shows the planned weight; the bar shows what's actually in the pipeline.</p>
        </Card>
      </div>

      {/* audience */}
      <Card className="mt-4">
        <h3 className="display font-bold mb-3 flex items-center gap-2"><Users size={17} className="text-accent" /> Audience segments</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.pSegs.map((s) => (
            <div key={s.id} className="glass-2 hairline border rounded-xl p-3">
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-muted">{s.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-faint mb-1.5">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
