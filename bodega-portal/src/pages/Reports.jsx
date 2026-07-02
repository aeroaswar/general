import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageTitle, Card, Stat } from "../ui.jsx";
import { useSelectedClient, useProjectContent } from "../store.jsx";
import { REPORT_SERIES } from "../seed.js";
import { TrendingUp, Eye, Heart } from "lucide-react";

const tooltipStyle = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--text)" };

export default function Reports() {
  const client = useSelectedClient();
  const content = useProjectContent();
  const series = REPORT_SERIES[client?.id] || [];
  const last = series[series.length - 1] || { reach: 0, eng: 0 };
  const first = series.find((s) => s.reach > 0) || last;
  const growth = first.reach ? Math.round(((last.reach - first.reach) / first.reach) * 100) : 0;

  return (
    <>
      <PageTitle kicker={client?.name} title="Reports — H1 2026" />

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <Stat label="Accounts reached" value={`${last.reach}K`} sub="June 2026" icon={Eye} accent="#2562e7" />
        <Stat label="Engagement rate" value={`${last.eng}%`} sub="June 2026" icon={Heart} accent="#d6336c" />
        <Stat label="Reach growth" value={`${growth}%`} sub="since first active month" icon={TrendingUp} accent="#0f9d58" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <p className="eyebrow mb-4">Accounts reached (K)</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "var(--card-2)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="reach" fill="#e8743b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <p className="eyebrow mb-4">Engagement rate (%)</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="eng" stroke="#2562e7" strokeWidth={2.5} dot={{ r: 3, fill: "#2562e7" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="eyebrow mb-2">Published this cycle</p>
        <p className="text-sm text-muted">
          {content.filter((c) => c.status === "Posted").length} posts live ·{" "}
          {content.filter((c) => c.status === "Scheduled").length} scheduled ·{" "}
          {content.filter((c) => ["Client Review", "Revision Requested"].includes(c.status)).length} in approval
        </p>
      </Card>
    </>
  );
}
