import { useMemo } from "react";
import { motion } from "framer-motion";
import { Megaphone, Calendar, Target } from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent } from "../store.jsx";
import { fmtDate } from "../lib/status.js";
import { Card, Badge, Progress, PageTitle, EmptyState, PlatformTag, fadeUp } from "../lib/ui.jsx";

const CAMP_C = { Planning: "#c97a0a", Active: "#0e9f8e", Complete: "#2562e7" };

export default function Campaigns() {
  const { campaigns, pillars } = useData();
  const projects = useVisibleProjects();
  const content = useVisibleContent();
  const projIds = new Set(projects.map((p) => p.id));

  const list = useMemo(() => {
    return campaigns.filter((c) => projIds.has(c.projectId)).map((c) => {
      const items = content.filter((ci) => ci.campaignId === c.id);
      const posted = items.filter((ci) => ci.status === "Posted").length;
      return {
        ...c,
        project: projects.find((p) => p.id === c.projectId),
        items, posted,
        progress: items.length ? Math.round((posted / items.length) * 100) : 0,
        pillarNames: (c.pillarIds || []).map((id) => pillars.find((p) => p.id === id)?.name).filter(Boolean),
      };
    });
  }, [campaigns, content, projects, pillars]);

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Time-bound" title="Campaigns">
        <Badge color="#2562e7">{list.length} running</Badge>
      </PageTitle>

      {list.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet" sub="Campaigns tie content to a time-bound objective." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((c) => (
            <Card key={c.id} hover className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-accent font-semibold">{c.project?.name}</p>
                  <h3 className="display font-bold leading-snug">{c.name}</h3>
                </div>
                <Badge color={CAMP_C[c.status] || "#6b7280"}>{c.status}</Badge>
              </div>
              {c.objective && <p className="text-sm text-muted mt-2 flex items-start gap-2"><Target size={15} className="mt-0.5 shrink-0 text-accent" />{c.objective}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="chip" style={{ color: "var(--muted)" }}><Calendar size={13} /> {fmtDate(c.startDate)} – {fmtDate(c.endDate)}</span>
                {c.pillarNames.map((n) => <span key={n} className="chip" style={{ color: "var(--muted)" }}>{n}</span>)}
              </div>
              <div className="mt-auto pt-4">
                <div className="flex justify-between text-xs text-muted mb-1.5"><span>{c.posted}/{c.items.length} posted</span><span>{c.progress}%</span></div>
                <Progress value={c.progress} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
