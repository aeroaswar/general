import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Download, Check, Send, Activity, Gauge, Clock, FileText, Link2 } from "lucide-react";
import { useData, useActiveProject, useProjectContent, useCurrentUser } from "../store.jsx";
import { PLATFORM_META, fmtDate } from "../lib/status.js";
import { Card, Button, Stat, Modal, PageTitle, cx } from "../lib/ui.jsx";

const PIE_COLORS = ["#2562e7", "#01dcb4", "#6d4fe0", "#fa1e88", "#c97a0a"];

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass !rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color || p.fill }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
}

export default function Reports() {
  const project = useActiveProject();
  const projContent = useProjectContent();
  const { reportSnapshots, addReportExport, generateSnapshot, pillars } = useData();
  const me = useCurrentUser();
  const [exported, setExported] = useState(false);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const snaps = useMemo(() => reportSnapshots.filter((s) => s.projectId === project?.id), [reportSnapshots, project]);

  const kpis = useMemo(() => {
    const posted = projContent.filter((c) => c.status === "Posted");
    const eng = posted.filter((c) => c.performance?.engagement);
    const avgEng = eng.length ? (eng.reduce((s, c) => s + c.performance.engagement, 0) / eng.length).toFixed(1) : "—";
    const last = snaps[snaps.length - 1];
    const consistency = last ? Math.round((last.posted / Math.max(1, last.planned)) * 100) : 0;
    const turnaround = last ? Math.round(last.approvalAvgHours) : 0;
    return { posted: posted.length, avgEng, consistency, turnaround };
  }, [projContent, snaps]);

  const pillarMix = useMemo(() => {
    const names = Object.fromEntries(pillars.map((p) => [p.id, p.name]));
    const m = {};
    projContent.forEach((c) => { const n = names[c.pillarId] || "Other"; m[n] = (m[n] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [projContent, pillars]);

  const platformMix = useMemo(() => {
    const m = {};
    projContent.forEach((c) => { m[c.platform] = (m[c.platform] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [projContent]);

  const axis = { stroke: "var(--faint)", fontSize: 11, tickLine: false, axisLine: false };

  const exportPdf = () => {
    addReportExport({ scopeLabel: project?.name || "Report", exportedBy: me.id, snapshotId: report?.id, fileName: `${(project?.name || "report").toLowerCase().replace(/\s+/g, "-")}.pdf`, format: "PDF" });
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  if (!project) return <p className="text-muted">No project selected.</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTitle kicker={project?.name || "Performance"} title="Reports">
        {me.role === "client"
          ? <Button onClick={exportPdf}>{exported ? <><Check size={16} /> Exported</> : <><Download size={16} /> Export PDF</>}</Button>
          : <Button onClick={() => { setExported(false); setCopied(false); setReport(generateSnapshot(project.id, `${project.name} — ${fmtDate(new Date(), "MMM d, yyyy")}`)); }}><FileText size={16} /> Generate report</Button>}
      </PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Posted" value={kpis.posted} sub="published items" icon={Send} />
        <Stat label="Avg engagement" value={`${kpis.avgEng}%`} sub="on posted content" icon={Activity} accent="#6d4fe0" />
        <Stat label="Consistency" value={`${kpis.consistency}%`} sub="posted vs planned" icon={Gauge} accent="#2562e7" />
        <Stat label="Approval time" value={`${kpis.turnaround}h`} sub="latest cycle" icon={Clock} accent="#c97a0a" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <h3 className="display font-bold mb-4">Planned vs Posted</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={snaps} margin={{ left: -18, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2562e7" stopOpacity={0.5} /><stop offset="100%" stopColor="#2562e7" stopOpacity={0} /></linearGradient>
                <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#01dcb4" stopOpacity={0.5} /><stop offset="100%" stopColor="#01dcb4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={28} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="planned" name="Planned" stroke="#2562e7" fill="url(#gP)" strokeWidth={2} />
              <Area type="monotone" dataKey="posted" name="Posted" stroke="#01dcb4" fill="url(#gO)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="display font-bold mb-4">Approval turnaround (hrs)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={snaps} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={28} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="approvalAvgHours" name="Avg hours" stroke="#6d4fe0" strokeWidth={2.5} dot={{ r: 3, fill: "#6d4fe0" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="display font-bold mb-4">Content mix by pillar</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pillarMix} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={3} stroke="none">
                {pillarMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {pillarMix.map((p, i) => (
              <span key={p.name} className="inline-flex items-center gap-1.5 text-xs text-muted"><i className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{p.name}</span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="display font-bold mb-4">Platform distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={platformMix} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="name" {...axis} />
              <YAxis {...axis} width={28} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "var(--card-2)" }} />
              <Bar dataKey="value" name="Items" radius={[6, 6, 0, 0]}>
                {platformMix.map((p, i) => <Cell key={i} fill={PLATFORM_META[p.name] || "#2562e7"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <p className="text-xs text-faint mt-4">Report scope: {project.name} · {fmtDate(project.startDate)} – {fmtDate(project.endDate)} · snapshots are frozen per cycle.</p>

      <Modal open={!!report} onClose={() => setReport(null)} title="Report snapshot" width={520}>
        {report && (
          <div>
            <p className="text-sm text-muted mb-4">Frozen {fmtDate(report.date, "MMM d, yyyy")} · {project.name}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[["Planned", report.planned], ["Posted", report.posted], ["Consistency", Math.round((report.posted / Math.max(1, report.planned)) * 100) + "%"], ["Approval", report.approvalAvgHours + "h"]].map(([k, v]) => (
                <div key={k} className="glass-2 hairline border rounded-xl p-3 text-center"><div className="display text-2xl font-extrabold grad-text">{v}</div><div className="text-xs text-faint mt-1">{k}</div></div>
              ))}
            </div>
            <p className="text-xs text-faint mb-4">This snapshot is frozen — it won't shift as new content moves. Share it or export a PDF.</p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={exportPdf}>{exported ? <><Check size={16} /> Exported</> : <><Download size={16} /> Export PDF</>}</Button>
              <Button variant="ghost" className="flex-1" onClick={() => { navigator.clipboard?.writeText(`${location.origin}${location.pathname}#/app/reports?snap=${report.id}`); setCopied(true); }}>{copied ? <><Check size={16} /> Copied</> : <><Link2 size={16} /> Copy link</>}</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
