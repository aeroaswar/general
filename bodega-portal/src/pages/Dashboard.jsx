import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Users, FolderKanban, Megaphone, FileText, Columns3, CheckCircle2, CalendarDays, BarChart3,
  ClipboardList, Compass, Plus, ArrowUpRight, Bell, ClipboardCheck, Send, TrendingUp,
} from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent, useSelectedClient, useCurrentUser, userById } from "../store.jsx";
import { fmtDate, fromNow } from "../lib/status.js";
import { Card, Stat, StatusBadge, PlatformTag, Avatar, PageTitle, Button, fadeUp } from "../lib/ui.jsx";

const fmtReach = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : n);
const todayStr = () => new Date().toISOString().slice(0, 10);

const FLOW = [
  { n: 1, label: "Client", icon: Users, href: "/app/projects" },
  { n: 2, label: "Project", icon: FolderKanban, href: "/app/projects" },
  { n: 3, label: "Campaign", icon: Megaphone, href: "/app/campaigns" },
  { n: 4, label: "Brief", icon: FileText, href: "/app/content" },
  { n: 5, label: "Content", icon: Columns3, href: "/app/content" },
  { n: 6, label: "Approval", icon: CheckCircle2, href: "/app/approvals" },
  { n: 7, label: "Schedule", icon: CalendarDays, href: "/app/calendar" },
  { n: 8, label: "Report", icon: BarChart3, href: "/app/reports" },
];

const PATH = [
  { n: "01", icon: ClipboardList, title: "Assess client", desc: "Capture business, audience, channels", href: "/app/assessment" },
  { n: "02", icon: Compass, title: "Set strategy", desc: "Customize phases, pillars, audiences", href: "/app/projects" },
  { n: "03", icon: FolderKanban, title: "Open project", desc: "Review the project hub & framework", href: "/app/projects" },
  { n: "04", icon: Megaphone, title: "Map campaign", desc: "Connect objective, audience, outputs", href: "/app/campaigns" },
  { n: "05", icon: FileText, title: "Brief & draft", desc: "Turn strategy into clear content", href: "/app/content" },
  { n: "06", icon: Columns3, title: "Create content", desc: "Produce output, assign owner, check readiness", href: "/app/content" },
  { n: "07", icon: CheckCircle2, title: "Approve", desc: "Comment, approve, or request revisions", href: "/app/approvals" },
  { n: "08", icon: CalendarDays, title: "Schedule", desc: "Review the publishing timeline", href: "/app/calendar" },
  { n: "09", icon: BarChart3, title: "Report", desc: "Read consistency, mix, turnaround", href: "/app/reports" },
];

export default function Dashboard() {
  const projects = useVisibleProjects();
  const content = useVisibleContent();
  const { approvals, comments, assetRequests } = useData();
  const client = useSelectedClient();
  const me = useCurrentUser();

  const counts = useMemo(() => {
    const awaiting = content.filter((c) => c.status === "Client Review").length;
    const approved = content.filter((c) => c.status === "Approved").length;
    const scheduled = content.filter((c) => c.status === "Scheduled").length;
    const posted = content.filter((c) => c.status === "Posted").length;
    const reach = content.reduce((s, c) => s + (c.performance?.reach || 0), 0);
    return { awaiting, approved, scheduled, posted, reach };
  }, [content]);

  if (me.role === "client") return <ClientDashboard me={me} client={client} content={content} counts={counts} />;

  // ── team / admin "Cockpit" ────────────────────────────
  const projIds = new Set(projects.map((p) => p.id));
  const today = todayStr();
  const open = content.filter((c) => !["Posted", "Archived"].includes(c.status));
  const actions = {
    approvals: content.filter((c) => c.status === "Client Review").length,
    overdue: open.filter((c) => c.deadline && c.deadline < today).length,
    missingAssets: assetRequests.filter((r) => projIds.has(r.projectId) && ["Requested", "In Progress"].includes(r.status)).length,
    comments: comments.filter((cm) => { const it = content.find((c) => c.id === cm.contentItemId); return it && !["Posted", "Archived"].includes(it.status); }).length,
    dueWeek: content.filter((c) => c.publishDate >= today && c.publishDate <= addDays(7)).length,
  };
  const needDecision = actions.approvals + actions.overdue + actions.missingAssets + actions.comments + actions.dueWeek;

  // map content statuses → flow stages, and figure out where the program actually is
  const stageCount = {
    Brief: content.filter((c) => ["Idea", "Briefing"].includes(c.status)).length,
    Content: content.filter((c) => ["Draft", "Internal Review"].includes(c.status)).length,
    Approval: content.filter((c) => ["Client Review", "Revision Requested"].includes(c.status)).length,
    Schedule: content.filter((c) => ["Approved", "Scheduled"].includes(c.status)).length,
    Report: content.filter((c) => c.status === "Posted").length,
  };
  const focus = ["Approval", "Content", "Brief", "Schedule", "Report"].find((k) => stageCount[k] > 0) || "Client";

  const upcoming = content.filter((c) => ["Scheduled", "Approved"].includes(c.status)).sort((a, b) => a.publishDate.localeCompare(b.publishDate)).slice(0, 5);
  const activity = (() => {
    const cById = Object.fromEntries(content.map((c) => [c.id, c]));
    const a = approvals.filter((x) => cById[x.contentItemId]).map((x) => ({ id: x.id, who: userById(x.actorId)?.name || "Someone", ts: x.timestamp, verb: x.action === "approved" ? "approved" : x.action === "revision_requested" ? "requested changes on" : "commented on", item: cById[x.contentItemId]?.title }));
    return a.sort((p, q) => q.ts.localeCompare(p.ts)).slice(0, 5);
  })();

  return (
    <motion.div {...fadeUp}>
      <p className="eyebrow mb-2">Operations dashboard</p>
      <h1 className="display text-4xl md:text-5xl font-semibold tracking-[-0.02em]">{client?.name}</h1>
      <p className="text-muted mt-2">{client?.industry} · {projects.length} active project{projects.length === 1 ? "" : "s"} scoped to this client.</p>

      {/* FLOW stepper — live counts + where the program is now */}
      <div className="flex flex-wrap items-center gap-2 mt-6">
        <span className="eyebrow mr-1">Flow</span>
        {FLOW.map((s) => {
          const cnt = stageCount[s.label] || 0;
          const active = s.label === focus;
          return (
            <Link key={s.n} href={s.href} className={cxPill(active)} style={active ? { background: "var(--text)", color: "var(--bg)" } : undefined}>
              <span className="mono text-[11px] opacity-70">{s.n}</span>
              <s.icon size={14} /> {s.label}
              {cnt > 0 && <span className="mono text-[10px] px-1.5 rounded" style={{ background: active ? "rgba(0,0,0,.18)" : "var(--card-2)" }}>{cnt}</span>}
            </Link>
          );
        })}
      </div>

      {/* OPERATING PATH */}
      <Card className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="eyebrow mb-2"><span className="text-accent">✳</span> Operating path</p>
            <h2 className="display text-xl md:text-2xl font-semibold">Client → Project → Campaign → Brief → Content → Approval → Schedule → Report</h2>
            <p className="text-muted text-sm mt-1.5">Everything answers one question: what's the next operational step for this client program?</p>
          </div>
          <Link href="/app/content"><Button><Plus size={16} /> Create content</Button></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PATH.map((s) => (
            <Link key={s.n} href={s.href} className="glass-2 hairline border rounded-xl p-4 transition-colors hover:border-[color:var(--line-2)] group">
              <div className="flex items-start justify-between">
                <span className="w-9 h-9 grid place-items-center rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--line)" }}><s.icon size={16} /></span>
                <span className="mono text-xs text-faint">{s.n}</span>
              </div>
              <p className="display font-semibold mt-3">{s.title}</p>
              <p className="text-xs text-muted mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </Card>

      {/* TODAY'S ACTIONS */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="eyebrow mb-1">Today's actions</p>
            <h2 className="display text-2xl font-semibold">{needDecision} item{needDecision === 1 ? "" : "s"} need a decision</h2>
          </div>
          <Bell size={18} className="text-faint" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <ActionTile label="Approvals waiting" value={actions.approvals} href="/app/approvals" />
          <ActionTile label="Overdue content" value={actions.overdue} href="/app/content" />
          <ActionTile label="Missing assets" value={actions.missingAssets} href="/app/assets" />
          <ActionTile label="Unresolved comments" value={actions.comments} href="/app/content" />
          <ActionTile label="Due this week" value={actions.dueWeek} href="/app/calendar" />
        </div>
      </div>

      {/* upcoming + activity */}
      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display text-lg font-semibold">Upcoming schedule</h3>
            <Link href="/app/calendar" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Calendar <ArrowUpRight size={15} /></Link>
          </div>
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
            {upcoming.length === 0 && <p className="text-sm text-muted py-2">Nothing scheduled yet.</p>}
            {upcoming.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-12 text-center shrink-0"><div className="display text-lg font-semibold leading-none">{fmtDate(c.publishDate, "d")}</div><div className="mono text-[10px] text-faint uppercase mt-0.5">{fmtDate(c.publishDate, "MMM")}</div></div>
                <div className="min-w-0 flex-1"><p className="font-medium truncate">{c.title}</p><p className="text-xs text-muted">{c.format} · {c.platform}</p></div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="display text-lg font-semibold mb-4">Recent activity</h3>
          <div className="flex flex-col gap-3.5">
            {activity.length === 0 && <p className="text-sm text-muted">No activity yet.</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <Avatar name={a.who} size={28} />
                <div className="min-w-0"><p className="text-sm leading-snug"><b>{a.who}</b> <span className="text-muted">{a.verb}</span> {a.item}</p><p className="mono text-[10px] text-faint mt-0.5">{fromNow(a.ts)}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function cxPill(active) {
  return "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors " +
    (active ? "" : "text-muted hover:text-[color:var(--text)] border-[color:var(--line)] hover:border-[color:var(--line-2)]");
}

function ActionTile({ label, value, href }) {
  const tone = value > 0 ? "#e8743b" : "var(--faint)";
  return (
    <Link href={href} className="glass-2 hairline border rounded-xl p-4 transition-colors hover:border-[color:var(--line-2)]">
      <div className="display text-3xl font-semibold" style={{ color: value > 0 ? "var(--text)" : "var(--faint)" }}>{value}</div>
      <p className="eyebrow mt-2" style={{ color: tone }}>{label}</p>
    </Link>
  );
}

/* ── client view ─────────────────────────────────────── */
function ClientDashboard({ me, client, content, counts }) {
  const needs = content.filter((c) => c.status === "Client Review").sort((a, b) => (a.clientReviewDue || "").localeCompare(b.clientReviewDue || ""));
  const coming = content.filter((c) => c.status === "Scheduled").sort((a, b) => a.publishDate.localeCompare(b.publishDate)).slice(0, 5);
  const live = content.filter((c) => c.status === "Posted").sort((a, b) => b.publishDate.localeCompare(a.publishDate)).slice(0, 4);

  return (
    <motion.div {...fadeUp}>
      <p className="eyebrow mb-2">Your portal</p>
      <h1 className="display text-4xl md:text-5xl font-semibold tracking-[-0.02em]">Hi, {me.name.split(" ")[0]}</h1>
      <p className="text-muted mt-2">{counts.awaiting} item{counts.awaiting === 1 ? "" : "s"} waiting for your review.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Stat label="Needs your review" value={counts.awaiting} sub="approve or revise" icon={ClipboardCheck} accent="#c97a0a" />
        <Stat label="Approved" value={counts.approved} sub="ready to go" icon={CheckCircle2} accent="#0e9f8e" />
        <Stat label="Scheduled" value={counts.scheduled} sub="upcoming" icon={Send} accent="#6d4fe0" />
        <Stat label="Reach" value={fmtReach(counts.reach)} sub="on live content" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="display text-lg font-semibold">Needs your review</h3>
            <Link href="/app/approvals" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Review all <ArrowUpRight size={15} /></Link>
          </div>
          {needs.length === 0 ? (
            <div className="flex-1 grid place-items-center text-center py-8"><div><CheckCircle2 className="mx-auto text-faint mb-2" /><p className="text-sm text-muted">You're all caught up.</p></div></div>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
              {needs.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1"><p className="font-medium truncate">{c.title}</p><p className="text-xs text-muted">{c.format} · {c.platform} · due {fmtDate(c.clientReviewDue)}</p></div>
                  <Link href="/app/approvals"><Button size="sm">Review</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3 className="display text-lg font-semibold mb-4">Recently live</h3>
          <div className="flex flex-col gap-3">
            {live.length === 0 && <p className="text-sm text-muted">Nothing posted yet.</p>}
            {live.map((c) => (
              <div key={c.id}><p className="text-sm font-medium leading-snug">{c.title}</p><p className="text-xs text-muted">{c.performance?.reach ? fmtReach(c.performance.reach) + " reached" : c.platform} · {fromNow(c.publishDate)}</p></div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="display text-lg font-semibold">Coming up</h3>
          <Link href="/app/calendar" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Calendar <ArrowUpRight size={15} /></Link>
        </div>
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
          {coming.length === 0 && <p className="text-sm text-muted">Nothing scheduled yet.</p>}
          {coming.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-12 text-center shrink-0"><div className="display text-lg font-semibold leading-none">{fmtDate(c.publishDate, "d")}</div><div className="mono text-[10px] text-faint uppercase mt-0.5">{fmtDate(c.publishDate, "MMM")}</div></div>
              <div className="min-w-0 flex-1"><p className="font-medium truncate">{c.title}</p><p className="text-xs text-muted">{c.format} · {c.platform}</p></div>
              <PlatformTag platform={c.platform} />
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
