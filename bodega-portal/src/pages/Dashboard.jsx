import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { FolderKanban, ClipboardCheck, Send, Clock, ArrowUpRight, TrendingUp, CalendarPlus, CheckCircle2 } from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent, useSelectedClient, useCurrentUser, userById } from "../store.jsx";
import { BOARD_COLUMNS, STATUS_META, PROJECT_STATUS_C, fmtDate, fromNow } from "../lib/status.js";
import { Card, Stat, StatusBadge, PlatformTag, Avatar, Progress, PageTitle, Badge, Button, fadeUp } from "../lib/ui.jsx";

const fmtReach = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : n);

export default function Dashboard() {
  const projects = useVisibleProjects();
  const content = useVisibleContent();
  const { approvals, comments, reportSnapshots, setSelectedProjectId } = useData();
  const client = useSelectedClient();
  const me = useCurrentUser();
  const [, navigate] = useLocation();

  const counts = useMemo(() => {
    const awaiting = content.filter((c) => c.status === "Client Review").length;
    const approved = content.filter((c) => c.status === "Approved").length;
    const scheduled = content.filter((c) => c.status === "Scheduled").length;
    const posted = content.filter((c) => c.status === "Posted").length;
    const reach = content.reduce((s, c) => s + (c.performance?.reach || 0), 0);
    return { awaiting, approved, scheduled, posted, reach };
  }, [content]);

  const upcoming = useMemo(
    () => content.filter((c) => ["Scheduled", "Approved"].includes(c.status)).sort((a, b) => a.publishDate.localeCompare(b.publishDate)).slice(0, 5),
    [content]
  );

  if (me.role === "client") {
    return <ClientDashboard me={me} client={client} content={content} counts={counts} />;
  }

  // ── team / admin ──────────────────────────────────────
  const byStatus = Object.fromEntries(BOARD_COLUMNS.map((s) => [s, 0]));
  content.forEach((c) => { if (byStatus[c.status] != null) byStatus[c.status]++; });
  const maxCount = Math.max(1, ...Object.values(byStatus));
  const projIds = new Set(projects.map((p) => p.id));
  const snaps = reportSnapshots.filter((s) => projIds.has(s.projectId));
  const turnaround = snaps.length ? Math.round(snaps[snaps.length - 1].approvalAvgHours) : 0;
  const readyToSchedule = content.filter((c) => c.status === "Approved");

  const activity = (() => {
    const cById = Object.fromEntries(content.map((c) => [c.id, c]));
    const a = approvals.filter((x) => cById[x.contentItemId]).map((x) => ({
      id: x.id, who: userById(x.actorId)?.name || "Someone", ts: x.timestamp,
      verb: x.action === "approved" ? "approved" : x.action === "revision_requested" ? "requested changes on" : "commented on",
      item: cById[x.contentItemId]?.title, note: x.note,
    }));
    const c = comments.filter((x) => cById[x.contentItemId]).map((x) => ({
      id: x.id, who: userById(x.authorId)?.name || "Someone", ts: x.timestamp, verb: "commented on", item: cById[x.contentItemId]?.title, note: x.body,
    }));
    return [...a, ...c].sort((p, q) => q.ts.localeCompare(p.ts)).slice(0, 6);
  })();

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={client?.name} title={`Welcome back, ${me.name.split(" ")[0]}`}>
        <Link href="/app/content"><Badge color="#2562e7">{content.length} content items</Badge></Link>
      </PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active projects" value={projects.filter((p) => p.status === "Active").length || projects.length} sub={`${projects.length} total`} icon={FolderKanban} />
        <Stat label="Awaiting approval" value={counts.awaiting} sub="in Client Review" icon={ClipboardCheck} accent="#c97a0a" />
        <Stat label="Scheduled / posted" value={`${counts.scheduled} / ${counts.posted}`} sub="this cycle" icon={Send} accent="#6d4fe0" />
        <Stat label="Avg approval time" value={`${turnaround}h`} sub="turnaround" icon={Clock} accent="#2562e7" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display font-bold">Content pipeline</h3>
            <Link href="/app/content" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Open board <ArrowUpRight size={15} /></Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {BOARD_COLUMNS.map((s) => {
              const m = STATUS_META[s];
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-muted">{m.label}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(byStatus[s] / maxCount) * 100}%`, background: m.c }} />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold tabular-nums">{byStatus[s]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ready to schedule tray */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="display font-bold flex items-center gap-2"><CalendarPlus size={17} className="text-accent" /> Ready to schedule</h3>
            <Badge color="#0e9f8e">{readyToSchedule.length}</Badge>
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            {readyToSchedule.length === 0 && <p className="text-sm text-muted">Nothing approved is waiting. 🎉</p>}
            {readyToSchedule.slice(0, 4).map((c) => (
              <div key={c.id} className="glass-2 hairline border rounded-xl p-3">
                <p className="text-sm font-medium leading-snug">{c.title}</p>
                <p className="text-xs text-muted mt-0.5">{c.platform} · approved</p>
              </div>
            ))}
          </div>
          {readyToSchedule.length > 0 && <Link href="/app/calendar" className="mt-3"><Button variant="ghost" className="w-full">Open calendar <ArrowUpRight size={15} /></Button></Link>}
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
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
                <div className="min-w-0 flex-1"><p className="font-medium truncate">{c.title}</p><p className="text-xs text-muted">{c.format} · {c.platform}</p></div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {projects.map((p) => (
          <button key={p.id} className="text-left" onClick={() => { setSelectedProjectId(p.id); navigate("/app/projects"); }}>
            <Card hover className="h-full">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-bold">{p.name}</h4>
                <Badge color={PROJECT_STATUS_C[p.status]}>{p.status}</Badge>
              </div>
              <p className="text-xs text-muted mt-1">{p.cadence} · {p.platforms.join(", ")}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-muted w-12">Health</span>
                <div className="flex-1"><Progress value={p.health} /></div>
                <span className="text-sm font-semibold tabular-nums">{p.health}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── client view: "what needs me" ─────────────────────── */
function ClientDashboard({ me, client, content, counts }) {
  const needs = content.filter((c) => c.status === "Client Review").sort((a, b) => (a.clientReviewDue || "").localeCompare(b.clientReviewDue || ""));
  const coming = content.filter((c) => c.status === "Scheduled").sort((a, b) => a.publishDate.localeCompare(b.publishDate)).slice(0, 5);
  const live = content.filter((c) => c.status === "Posted").sort((a, b) => b.publishDate.localeCompare(a.publishDate)).slice(0, 4);

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={client?.name} title={`Hi, ${me.name.split(" ")[0]}`}>
        <Badge color="#c97a0a">{counts.awaiting} awaiting you</Badge>
      </PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Needs your review" value={counts.awaiting} sub="approve or revise" icon={ClipboardCheck} accent="#c97a0a" />
        <Stat label="Approved" value={counts.approved} sub="ready to go" icon={CheckCircle2} accent="#0e9f8e" />
        <Stat label="Scheduled" value={counts.scheduled} sub="upcoming" icon={Send} accent="#6d4fe0" />
        <Stat label="Reach" value={fmtReach(counts.reach)} sub="on live content" icon={TrendingUp} accent="#2562e7" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display font-bold">Needs your review</h3>
            <Link href="/app/approvals" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Review all <ArrowUpRight size={15} /></Link>
          </div>
          {needs.length === 0 ? (
            <div className="flex-1 grid place-items-center text-center py-8"><div><CheckCircle2 className="mx-auto text-faint mb-2" /><p className="text-sm text-muted">You're all caught up.</p></div></div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
              {needs.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted">{c.format} · {c.platform} · due {fmtDate(c.clientReviewDue)}</p>
                  </div>
                  <Link href="/app/approvals"><Button size="sm">Review</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="display font-bold mb-4">Recently live</h3>
          <div className="flex flex-col gap-3">
            {live.length === 0 && <p className="text-sm text-muted">Nothing posted yet.</p>}
            {live.map((c) => (
              <div key={c.id}>
                <p className="text-sm font-medium leading-snug">{c.title}</p>
                <p className="text-xs text-muted">{c.performance?.reach ? fmtReach(c.performance.reach) + " reached" : c.platform} · {fromNow(c.publishDate)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="display font-bold">Coming up</h3>
          <Link href="/app/calendar" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Calendar <ArrowUpRight size={15} /></Link>
        </div>
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
          {coming.length === 0 && <p className="text-sm text-muted">Nothing scheduled yet.</p>}
          {coming.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-12 text-center shrink-0"><div className="display text-lg font-bold leading-none">{fmtDate(c.publishDate, "d")}</div><div className="text-[11px] text-faint uppercase">{fmtDate(c.publishDate, "MMM")}</div></div>
              <div className="min-w-0 flex-1"><p className="font-medium truncate">{c.title}</p><p className="text-xs text-muted">{c.format} · {c.platform}</p></div>
              <PlatformTag platform={c.platform} />
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
