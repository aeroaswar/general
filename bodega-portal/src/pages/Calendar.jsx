import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, format, isSameMonth, isSameDay, parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useVisibleContent } from "../store.jsx";
import { STATUS_META, BOARD_COLUMNS, fmtDate } from "../lib/status.js";
import { Card, Button, StatusBadge, PlatformTag, PageTitle, EmptyState, cx } from "../lib/ui.jsx";

export default function Calendar() {
  const content = useVisibleContent();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const byDay = useMemo(() => {
    const m = {};
    content.forEach((c) => { if (c.publishDate) (m[c.publishDate] ||= []).push(c); });
    return m;
  }, [content]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const selKey = format(selected, "yyyy-MM-dd");
  const selItems = byDay[selKey] || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTitle kicker="Schedule" title="Calendar">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setCursor(new Date()); setSelected(new Date()); }}>Today</Button>
          <div className="flex items-center gap-1 glass-2 hairline border rounded-full">
            <button className="p-1.5 text-muted hover:text-[color:var(--text)]" onClick={() => setCursor((c) => addMonths(c, -1))}><ChevronLeft size={18} /></button>
            <span className="display font-semibold text-sm w-28 text-center">{format(cursor, "MMMM yyyy")}</span>
            <button className="p-1.5 text-muted hover:text-[color:var(--text)]" onClick={() => setCursor((c) => addMonths(c, 1))}><ChevronRight size={18} /></button>
          </div>
        </div>
      </PageTitle>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <Card className="!p-3">
          <div className="grid grid-cols-7 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-[11px] uppercase tracking-wider text-faint py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const items = byDay[key] || [];
              const inMonth = isSameMonth(d, cursor);
              const isSel = isSameDay(d, selected);
              const isToday = isSameDay(d, new Date());
              return (
                <button
                  key={key}
                  onClick={() => setSelected(d)}
                  className={cx("min-h-[84px] rounded-xl p-1.5 text-left border transition-colors flex flex-col gap-1", isSel ? "border-[color:var(--line-2)]" : "border-transparent hover:border-[color:var(--line)]")}
                  style={{ background: isSel ? "var(--glass)" : inMonth ? "var(--glass-2)" : "transparent", opacity: inMonth ? 1 : 0.4 }}
                >
                  <span className={cx("text-xs font-semibold w-6 h-6 grid place-items-center rounded-full", isToday && "text-[#04201b]")} style={isToday ? { background: "linear-gradient(135deg,#45e6c6,#37b9ff)" } : undefined}>{format(d, "d")}</span>
                  <div className="flex flex-col gap-1">
                    {items.slice(0, 2).map((c) => (
                      <span key={c.id} className="text-[10px] leading-tight truncate pl-1.5 border-l-2" style={{ borderColor: STATUS_META[c.status]?.c }}>{c.title}</span>
                    ))}
                    {items.length > 2 && <span className="text-[10px] text-faint pl-1.5">+{items.length - 2} more</span>}
                  </div>
                </button>
              );
            })}
          </div>
          {/* legend */}
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t hairline">
            {["Scheduled", "Client Review", "Approved", "Posted", "Draft"].map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-muted"><i className="w-2 h-2 rounded-full" style={{ background: STATUS_META[s].c }} />{s}</span>
            ))}
          </div>
        </Card>

        {/* day panel */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-mint" />
            <h3 className="display font-bold">{format(selected, "EEEE, MMM d")}</h3>
          </div>
          {selItems.length === 0 ? (
            <p className="text-sm text-muted">Nothing scheduled this day.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selItems.map((c) => (
                <div key={c.id} className="glass-2 hairline border rounded-xl p-3">
                  <p className="font-medium text-sm leading-snug">{c.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={c.status} />
                    <PlatformTag platform={c.platform} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
