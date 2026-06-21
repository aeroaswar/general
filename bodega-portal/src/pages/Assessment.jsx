import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, ClipboardList } from "lucide-react";
import { useData, useActiveProject } from "../store.jsx";
import { Card, PageTitle, EmptyState, fadeUp } from "../lib/ui.jsx";

export default function Assessment() {
  const project = useActiveProject();
  const { phases, pillars, audienceSegments, contentItems, assets, approvals } = useData();

  const checks = useMemo(() => {
    if (!project) return [];
    const items = contentItems.filter((c) => c.projectId === project.id);
    const itemIds = new Set(items.map((c) => c.id));
    return [
      { label: "Goals defined", ok: !!(project.goalBusiness && project.goalCampaign), hint: "Business + campaign goals are set." },
      { label: "Phases framework", ok: phases.filter((x) => x.projectId === project.id).length > 0, hint: "Project phases mapped." },
      { label: "Content pillars", ok: pillars.filter((x) => x.projectId === project.id).length > 0, hint: "Pillars with weights defined." },
      { label: "Audience segments", ok: audienceSegments.filter((x) => x.projectId === project.id).length > 0, hint: "At least one segment described." },
      { label: "Platforms & cadence", ok: project.platforms.length > 0 && !!project.cadence, hint: "Channels and posting rhythm chosen." },
      { label: "Content in pipeline", ok: items.length >= 3, hint: "≥3 items moving through the board." },
      { label: "Assets collected", ok: assets.some((a) => a.projectId === project.id), hint: "Source assets uploaded." },
      { label: "Approvals flowing", ok: approvals.some((a) => itemIds.has(a.contentItemId)) || items.some((c) => c.status === "Posted"), hint: "Review cycle is active." },
    ];
  }, [project, phases, pillars, audienceSegments, contentItems, assets, approvals]);

  if (!project) return <EmptyState icon={ClipboardList} title="No project" sub="Select a client with projects." />;

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);
  const R = 52, C = 2 * Math.PI * R;
  const tone = score >= 80 ? "#0f9d58" : score >= 50 ? "#c97a0a" : "#d6336c";

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={project?.name || "Readiness"} title="Assessment" />

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <Card className="flex flex-col items-center justify-center text-center">
          <div className="relative" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" className="-rotate-90">
              <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line)" strokeWidth="10" />
              <circle cx="70" cy="70" r={R} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} style={{ transition: "stroke-dashoffset 1s var(--ease)" }} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div><div className="display text-4xl font-extrabold">{score}</div><div className="text-xs text-faint -mt-1">ready</div></div>
            </div>
          </div>
          <p className="mt-4 font-semibold">{passed} of {checks.length} complete</p>
          <p className="text-sm text-muted">{score >= 80 ? "Ready to scale." : score >= 50 ? "Almost there." : "Setup in progress."}</p>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-3 p-4">
                <span className="w-7 h-7 grid place-items-center rounded-full shrink-0" style={{ background: c.ok ? "#0f9d5818" : "#d6336c18", color: c.ok ? "#0f9d58" : "#d6336c" }}>
                  {c.ok ? <Check size={15} /> : <X size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{c.label}</p>
                  <p className="text-xs text-muted">{c.hint}</p>
                </div>
                <span className="text-xs font-semibold" style={{ color: c.ok ? "#0f9d58" : "var(--faint)" }}>{c.ok ? "Done" : "Pending"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
