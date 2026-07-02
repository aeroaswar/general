import { FileText, CheckCircle2, CalendarDays, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Stat, PageTitle, StatusBadge, PlatformTag, Progress } from "../ui.jsx";
import { STAGES, fmtDate } from "../status.js";
import { useAuth, useData, useSelectedClient, useActiveProject, useProjectContent } from "../store.jsx";
import { REPORT_SERIES } from "../seed.js";

export default function Cockpit() {
  const { me } = useAuth();
  const { store } = useData();
  const client = useSelectedClient();
  const project = useActiveProject();
  const content = useProjectContent();

  const pending = store.approvals.filter((a) => !a.decision).length;
  const scheduled = content.filter((c) => c.status === "Scheduled" || c.status === "Approved").length;
  const live = content.filter((c) => c.status === "Posted").length;
  const openInvoices = store.invoices.filter((i) => i.clientId === client?.id && i.status !== "Paid").length;
  const series = REPORT_SERIES[client?.id] || [];

  const stageCount = (stage) => content.filter((c) => stage.statuses.includes(c.status)).length;
  const upNext = [...content]
    .filter((c) => c.publishDate)
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate))
    .slice(0, 4);

  return (
    <>
      <PageTitle kicker={`${client?.name || ""} · ${project?.name || ""}`} title={`Good to see you, ${me.name.split(" ")[0]}.`} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <Stat label="Content in flight" value={content.length} sub="items in this project" icon={FileText} accent="#2562e7" />
        <Stat label="Awaiting approval" value={pending} sub="client decisions pending" icon={CheckCircle2} accent="#c97a0a" />
        <Stat label="Ready / scheduled" value={scheduled} sub="cleared for the calendar" icon={CalendarDays} accent="#6d4fe0" />
        {me.role === "client"
          ? <Stat label="Posts live" value={live} sub="published this cycle" icon={Wallet} accent="#0f9d58" />
          : <Stat label="Open invoices" value={openInvoices} sub={client?.name} icon={Wallet} accent="#e8743b" />}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <p className="eyebrow mb-4">Reach — accounts reached (K) · 2026</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="reach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8743b" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#e8743b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--text)" }} />
                <Area type="monotone" dataKey="reach" stroke="#e8743b" strokeWidth={2} fill="url(#reach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="eyebrow mb-4">Pipeline — {project?.name}</p>
          <div className="flex flex-col gap-3.5">
            {STAGES.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.label}</span>
                  <span className="mono text-xs text-muted">{stageCount(s)}</span>
                </div>
                <Progress value={content.length ? (stageCount(s) / content.length) * 100 : 0} color={s.c} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="eyebrow mb-4">Up next on the calendar</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {upNext.map((c) => (
            <div key={c.id} className="glass-2 hairline border rounded-brand p-3.5 flex flex-col gap-2">
              <p className="font-semibold text-sm leading-snug">{c.title}</p>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={c.status} />
                <PlatformTag platform={c.platform} />
              </div>
              <p className="text-xs text-muted mono mt-auto">publishes {fmtDate(c.publishDate)}</p>
            </div>
          ))}
          {upNext.length === 0 && <p className="text-sm text-muted">Nothing scheduled yet.</p>}
        </div>
      </Card>
    </>
  );
}
