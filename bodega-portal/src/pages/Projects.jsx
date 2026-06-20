import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Target, Users, Megaphone, FolderKanban } from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent, useSelectedClient } from "../store.jsx";
import { PROJECT_STATUS_C, BOARD_COLUMNS, STATUS_META, fmtDate } from "../lib/status.js";
import { Card, Badge, Progress, Modal, PageTitle, PlatformTag, EmptyState, fadeUp } from "../lib/ui.jsx";

export default function Projects() {
  const projects = useVisibleProjects();
  const client = useSelectedClient();
  const [openId, setOpenId] = useState(null);
  const open = projects.find((p) => p.id === openId);

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={client?.name} title="Projects">
        <Badge color="#34e0c4">{projects.length} active</Badge>
      </PageTitle>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" sub="Projects for this client will appear here." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setOpenId(p.id)} className="text-left">
              <Card hover className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="display font-bold leading-snug">{p.name}</h3>
                  <Badge color={PROJECT_STATUS_C[p.status]}>{p.status}</Badge>
                </div>
                <p className="text-sm text-muted mt-1">{p.industry}</p>
                <p className="text-sm text-muted mt-3 line-clamp-2">{p.goalCampaign}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.platforms.map((pl) => <PlatformTag key={pl} platform={pl} />)}
                </div>
                <div className="mt-auto pt-4 flex items-center gap-3">
                  <span className="text-xs text-muted w-12">Health</span>
                  <div className="flex-1"><Progress value={p.health} /></div>
                  <span className="text-sm font-semibold tabular-nums">{p.health}</span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      <ProjectModal project={open} onClose={() => setOpenId(null)} />
    </motion.div>
  );
}

function ProjectModal({ project, onClose }) {
  const { phases, pillars, audienceSegments } = useData();
  const content = useVisibleContent();
  const data = useMemo(() => {
    if (!project) return null;
    return {
      phases: phases.filter((x) => x.projectId === project.id).sort((a, b) => a.order - b.order),
      pillars: pillars.filter((x) => x.projectId === project.id),
      segments: audienceSegments.filter((x) => x.projectId === project.id),
      counts: BOARD_COLUMNS.map((s) => ({ s, n: content.filter((c) => c.projectId === project.id && c.status === s).length })).filter((x) => x.n),
    };
  }, [project, phases, pillars, audienceSegments, content]);

  if (!project || !data) return null;
  return (
    <Modal open={!!project} onClose={onClose} title={project.name} width={680}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge color={PROJECT_STATUS_C[project.status]}>{project.status}</Badge>
        <span className="chip" style={{ color: "var(--muted)" }}>{project.industry}</span>
        <span className="chip" style={{ color: "var(--muted)" }}>{project.cadence}</span>
        <span className="chip" style={{ color: "var(--muted)" }}>{fmtDate(project.startDate)} – {fmtDate(project.endDate)}</span>
      </div>

      {/* goals */}
      <Section icon={Target} title="Goals">
        <Row k="Business" v={project.goalBusiness} />
        <Row k="Marketing" v={project.goalMarketing} />
        <Row k="Campaign" v={project.goalCampaign} />
      </Section>

      {/* framework */}
      <Section icon={Layers} title="Framework — phases">
        <div className="flex flex-col gap-2">
          {data.phases.map((ph) => (
            <div key={ph.id} className="flex gap-3 items-start">
              <span className="display font-bold text-mint w-6">{ph.order}</span>
              <div><p className="font-medium text-sm">{ph.name}</p><p className="text-xs text-muted">{ph.objective}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Megaphone} title="Content pillars">
        <div className="flex flex-col gap-2.5">
          {data.pillars.map((pl) => (
            <div key={pl.id}>
              <div className="flex justify-between text-sm"><span className="font-medium">{pl.name}</span><span className="text-muted">{pl.weight}%</span></div>
              <Progress value={pl.weight} color="linear-gradient(90deg,#8a76ff,#37b9ff)" />
              <p className="text-xs text-muted mt-1">{pl.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Users} title="Audience segments">
        <div className="flex flex-wrap gap-2">
          {data.segments.map((s) => <span key={s.id} className="chip" style={{ color: "var(--muted)" }} title={s.description}>{s.name}</span>)}
        </div>
      </Section>

      {/* content summary */}
      <div className="border-t hairline pt-4 mt-2">
        <p className="text-[11px] uppercase tracking-wider text-faint mb-2">Content in pipeline</p>
        <div className="flex flex-wrap gap-2">
          {data.counts.length === 0 && <span className="text-sm text-muted">No content yet.</span>}
          {data.counts.map(({ s, n }) => (
            <span key={s} className="chip" style={{ color: STATUS_META[s].c }}><i className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[s].c }} />{STATUS_META[s].label} · {n}</span>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-5">
      <p className="flex items-center gap-2 text-sm font-semibold mb-2"><Icon size={15} className="text-mint" /> {title}</p>
      {children}
    </div>
  );
}
function Row({ k, v }) {
  return <div className="flex gap-3 text-sm mb-1.5"><span className="text-faint w-20 shrink-0">{k}</span><span>{v}</span></div>;
}
