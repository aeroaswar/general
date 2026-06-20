import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { FolderKanban, ClipboardCheck, Send, Clock, ArrowUpRight, TrendingUp } from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent, useSelectedClient, useCurrentUser, userById } from "../store.jsx";
import { BOARD_COLUMNS, STATUS_META, fmtDate, fromNow } from "../lib/status.js";
import { Card, Stat, StatusBadge, PlatformTag, Avatar, Progress, PageTitle, Badge, fadeUp } from "../lib/ui.jsx";

export default function Dashboard() {
  const projects = useVisibleProjects();
  const content = useVisibleContent();
  const { approvals, comments, reportSnapshots } = useData();
  const client = useSelectedClient();
  const me = useCurrentUser();

  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(BOARD_COLUMNS.map((s) => [s, 0]));
    content.forEach((c) => { if (byStatus[c.status] != null) byStatus[c.status]++; });
    const awaiting = content.filter((c) => c.status === "Client Review").length;
    const posted = content.filter((c) => c.status === "Posted").length;
    const scheduled = content.filter((c) => c.status === "Scheduled").length;
    const reach = content.reduce((s, c) => s + (c.performance?.reach || 0), 0);
    const projIds = new Set(projects.map((p) => p.id));
    const snaps = reportSnapshots.filter((s) => projIds.has(s.projectId));
    const turnaround = snaps.length ? Math.round(snaps[snaps.length - 1].approvalAvgHours) : 0;
    return { byStatus, awaiting, posted, scheduled, reach, turnaround };
  }, [content, projects, reportSnapshots]);

  const upcoming = useMemo(
    () => content.filter((c) => ["Scheduled", "Approved"].includes(c.status))
      .sort((a, b) => a.publishDate.localeCompare(b.publishDate)).slice(0, 5),
    [content]
  );

  const activity = useMemo(() => {
    const cById = Object.fromEntries(content.map((c) => [c.id, c]));
    const a = approvals.filter((x) => cById[x.contentItemId]).map((x) => ({
      id: x.id, who: userById(x.actorId)?.name || "Someone", ts: x.timestamp,
      verb: x.action === "approved" ? "approved" : x.action === "revision_requested" ? "requested changes on" : "commented on",
      item: cById[x.contentItemId]?.title, note: x.note,
    }));
    const c = comments.filter((x) => cById[x.contentItemId]).map((x) => ({
      id: x.id, who: userById(x.authorId)?.name || "Someone", ts: x.timestamp, verb: "commented on",
      item: cById[x.contentItemId]?.title, note: x.body,
    }));
    return [...a, ...c].sort((p, q) => q.ts.localeCompare(p.ts)).slice(0, 6);
  }, [approvals, comments, content]);

  const maxCount = Math.max(1, ...Object.values(stats.byStatus));
  const fmtReach = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : n);

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={client?.name} title={`Welcome back, ${me.name.split(" ")[0]}`}>
        <Link href="/app/content"><Badge color="#2562e7">{content.length} content items</Badge></Link>
      </PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active projects" value={projects.filter((p) => p.status === "Active").length || projects.length} sub={`${projects.length} total`} icon={FolderKanban} />
        <Stat label="Awaiting approval" value={stats.awaiting} sub="in Client Review" icon={ClipboardCheck} accent="#c97a0a" />
        <Stat label="Scheduled / posted" value={`${stats.scheduled} / ${stats.posted}`} sub="this cycle" icon={Send} accent="#6d4fe0" />
        <Stat label="Avg approval time" value={`${stats.turnaround}h`} sub="turnaround" icon={Clock} accent="#2562e7" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        {/* pipeline */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display font-bold">Content pipeline</h3>
            <Link href="/app/content" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Open board <ArrowUpRight size={15} /></Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {BOARD_COLUMNS.map((s) => {
              const n = stats.byStatus[s];
              const m = STATUS_META[s];
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm" style={{ color: "var(--muted)" }}>{m.label}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(n / maxCount) * 100}%`, background: m.c }} />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold tabular-nums">{n}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* reach highlight */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="display font-bold">Reach</h3>
            <TrendingUp size={18} className="text-accent" />
          </div>
          <div>
            <div className="display text-5xl font-extrabold grad-text">{fmtReach(stats.reach)}</div>
            <p className="text-sm text-muted mt-1">accounts reached across posted content</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {projects.slice(0, 3).map((p) => <span key={p.id} className="chip" style={{ color: "var(--muted)" }}>{p.name}</span>)}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        {/* upcoming */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display font-bold">Upcoming schedule</h3>
            <Link href="/app/calendar" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Calendar <ArrowUpRight size={15} /></Link>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
            {upcoming.length === 0 && <p className="text-sm text-muted py-2">Nothing scheduled yet.</p>}
            {upcoming.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-12 text-center shrink-0">
                  <div className="display text-lg font-bold leading-none">{fmtDate(c.publishDate, "d")}</div>
                  <div className="text-[11px] text-faint uppercase">{fmtDate(c.publishDate, "MMM")}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted">{c.format} · {c.platform}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* activity */}
        <Card>
          <h3 className="display font-bold mb-4">Recent activity</h3>
          <div className="flex flex-col gap-3.5">
            {activity.length === 0 && <p className="text-sm text-muted">No activity yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <Avatar name={a.who} size={28} color="linear-gradient(135deg,#2562e7,#01dcb4)" />
                <div className="min-w-0">
                  <p className="text-sm leading-snug"><b>{a.who}</b> <span className="text-muted">{a.verb}</span> {a.item}</p>
                  {a.note && <p className="text-xs text-muted truncate">“{a.note}”</p>}
                  <p className="text-[11px] text-faint mt-0.5">{fromNow(a.ts)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* project health */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {projects.map((p) => (
          <Link key={p.id} href={`/app/projects`}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-bold">{p.name}</h4>
                <StatusBadge status={p.status === "Active" ? "Approved" : p.status === "Planning" ? "Client Review" : "Archived"} />
              </div>
              <p className="text-xs text-muted mt-1">{p.cadence} · {p.platforms.join(", ")}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-muted w-12">Health</span>
                <div className="flex-1"><Progress value={p.health} /></div>
                <span className="text-sm font-semibold tabular-nums">{p.health}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
