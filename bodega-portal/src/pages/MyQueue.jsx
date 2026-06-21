import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PenLine, Eye, RotateCcw, CalendarPlus, ChevronRight, CheckCircle2 } from "lucide-react";
import { useData, useVisibleContent, useVisibleProjects, useCurrentUser } from "../store.jsx";
import { checkMove, fmtDate } from "../lib/status.js";
import { Card, Button, PlatformTag, PageTitle, EmptyState, Badge, fadeUp } from "../lib/ui.jsx";

export default function MyQueue() {
  const content = useVisibleContent();
  const projects = useVisibleProjects();
  const { updateContentStatus, requestClientReview, assets } = useData();
  const me = useCurrentUser();
  const projName = (id) => projects.find((p) => p.id === id)?.name || "";
  const hasAssets = (pid) => assets.some((a) => a.projectId === pid);

  const mine = useMemo(() => content.filter((c) => c.ownerId === me.id), [content, me]);

  const groups = [
    { key: "Draft", label: "Drafts to finish", icon: PenLine, items: mine.filter((c) => c.status === "Draft") },
    { key: "Internal Review", label: "In internal review", icon: Eye, items: mine.filter((c) => c.status === "Internal Review") },
    { key: "Revision Requested", label: "Revisions to address", icon: RotateCcw, items: mine.filter((c) => c.status === "Revision Requested") },
    { key: "Approved", label: "Approved — schedule them", icon: CalendarPlus, items: mine.filter((c) => c.status === "Approved") },
  ].filter((g) => g.items.length);

  const totalOpen = groups.reduce((n, g) => n + g.items.length, 0);

  const action = (c) => {
    if (c.status === "Draft") { const g = checkMove(c, "Internal Review", { hasAssets: hasAssets(c.projectId) }); return { label: "Send to review", disabled: !g.ok, missing: g.missing, run: () => updateContentStatus(c.id, "Internal Review") }; }
    if (c.status === "Internal Review") { const g = checkMove(c, "Client Review", { hasAssets: hasAssets(c.projectId) }); return { label: "Send to client", disabled: !g.ok, missing: g.missing, run: () => requestClientReview(c.id, me.id) }; }
    if (c.status === "Revision Requested") return { label: "Reopen draft", disabled: false, run: () => updateContentStatus(c.id, "Draft") };
    return null; // Approved → schedule via Calendar
  };

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Your work" title="My Queue">
        <Badge color="#2562e7">{totalOpen} open</Badge>
      </PageTitle>

      {totalOpen === 0 ? (
        <EmptyState icon={CheckCircle2} title="Nothing on your plate" sub="Items you own that need action will show up here." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(({ key, label, icon: Icon, items }) => (
            <div key={key}>
              <h3 className="display font-bold mb-3 flex items-center gap-2"><Icon size={17} className="text-accent" /> {label} <span className="text-faint text-sm font-normal">· {items.length}</span></h3>
              <div className="grid md:grid-cols-2 gap-3">
                {items.map((c) => {
                  const a = action(c);
                  return (
                    <Card key={c.id} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug truncate">{c.title}</p>
                        <p className="text-xs text-muted mt-0.5">{projName(c.projectId)} · {c.platform} · {c.publishDate ? fmtDate(c.publishDate) : "no date"}</p>
                      </div>
                      <PlatformTag platform={c.platform} />
                      {c.status === "Approved" ? (
                        <Link href="/app/calendar"><Button size="sm"><CalendarPlus size={15} /> Schedule</Button></Link>
                      ) : a ? (
                        <Button size="sm" variant="ghost" disabled={a.disabled} title={a.disabled ? `Needs: ${a.missing.join(", ")}` : ""} onClick={a.run}>{a.label} <ChevronRight size={14} /></Button>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
