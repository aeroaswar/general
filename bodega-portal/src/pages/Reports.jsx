import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Download, Check, Send, Activity, Gauge, Clock } from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent, useCurrentUser } from "../store.jsx";
import { PLATFORM_META, fmtDate } from "../lib/status.js";
import { Card, Button, Stat, PageTitle, cx } from "../lib/ui.jsx";

const PIE_COLORS = ["#34e0c4", "#37b9ff", "#8a76ff", "#e06bd0", "#f5b14a"];

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
  const projects = useVisibleProjects();
  const content = useVisibleContent();
  const { reportSnapshots, addReportExport, pillars } = useData();
  const me = useCurrentUser();
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [exported, setExported] = useState(false);

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const snaps = useMemo(() => reportSnapshots.filter((s) => s.projectId === project?.id), [reportSnapshots, project]);
  const projContent = useMemo(() => content.filter((c) => c.projectId === project?.id), [content, project]);

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
    addReportExport({ scopeLabel: project?.name || "Report", exportedBy: me.id, fileName: `${(project?.name || "report").toLowerCase().replace(/\s+/g, "-")}.pdf`, format: "PDF" });
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  if (!project) return <p className="text-muted">No project selected.</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTitle kicker="Performance" title="Reports">
        <div className="flex items-center gap-2">
          <select className="input-glass !w-auto !py-1.5" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Button onClick={exportPdf}>{exported ? <><Check size={16} /> Exported</> : <><Download size={16} /> Export PDF</>}</Button>
        </div>
      </PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Posted" value={kpis.posted} sub="published items" icon={Send} />
        <Stat label="Avg engagement" value={`${kpis.avgEng}%`} sub="on posted content" icon={Activity} accent="#8a76ff" />
        <Stat label="Consistency" value={`${kpis.consistency}%`} sub="posted vs planned" icon={Gauge} accent="#37b9ff" />
        <Stat label="Approval time" value={`${kpis.turnaround}h`} sub="latest cycle" icon={Clock} accent="#f5b14a" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <h3 className="display font-bold mb-4">Planned vs Posted</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={snaps} margin={{ left: -18, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#37b9ff" stopOpacity={0.5} /><stop offset="100%" stopColor="#37b9ff" stopOpacity={0} /></linearGradient>
                <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34e0c4" stopOpacity={0.5} /><stop offset="100%" stopColor="#34e0c4" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={28} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="planned" name="Planned" stroke="#37b9ff" fill="url(#gP)" strokeWidth={2} />
              <Area type="monotone" dataKey="posted" name="Posted" stroke="#34e0c4" fill="url(#gO)" strokeWidth={2} />
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
              <Line type="monotone" dataKey="approvalAvgHours" name="Avg hours" stroke="#8a76ff" strokeWidth={2.5} dot={{ r: 3, fill: "#8a76ff" }} />
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
              <Tooltip content={<ChartTip />} cursor={{ fill: "var(--glass-2)" }} />
              <Bar dataKey="value" name="Items" radius={[6, 6, 0, 0]}>
                {platformMix.map((p, i) => <Cell key={i} fill={PLATFORM_META[p.name] || "#34e0c4"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <p className="text-xs text-faint mt-4">Report scope: {project.name} · {fmtDate(project.startDate)} – {fmtDate(project.endDate)} · snapshots are frozen per cycle.</p>
    </motion.div>
  );
}
