import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, parseISO, isValid } from "date-fns";
import { PageTitle, Card, cx } from "../ui.jsx";
import { STATUS_META } from "../status.js";
import { useProjectContent, useActiveProject } from "../store.jsx";

// The demo dataset lives in July 2026 — anchor the calendar there.
const ANCHOR = new Date(2026, 6, 1);

export default function Calendar() {
  const project = useActiveProject();
  const content = useProjectContent();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(ANCHOR), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(ANCHOR), { weekStartsOn: 1 }),
  });
  const byDay = (d) =>
    content.filter((c) => {
      if (!c.publishDate) return false;
      const p = parseISO(c.publishDate);
      return isValid(p) && format(p, "yyyy-MM-dd") === format(d, "yyyy-MM-dd");
    });

  return (
    <>
      <PageTitle kicker={project?.name} title={format(ANCHOR, "MMMM yyyy")} />
      <Card className="!p-3">
        <div className="grid grid-cols-7 gap-1.5">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <p key={d} className="eyebrow text-center py-1.5">{d}</p>
          ))}
          {days.map((d) => {
            const items = byDay(d);
            const inMonth = isSameMonth(d, ANCHOR);
            return (
              <div key={d.toISOString()} className={cx("min-h-[86px] rounded-lg border hairline p-1.5 flex flex-col gap-1", inMonth ? "glass-2" : "opacity-40")}>
                <span className="mono text-[11px] text-faint">{format(d, "d")}</span>
                {items.map((c) => {
                  const meta = STATUS_META[c.status];
                  return (
                    <span key={c.id} className="text-[11px] leading-tight font-medium rounded px-1.5 py-1 truncate" style={{ background: meta.c + "22", color: meta.c }} title={c.title}>
                      {c.title}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
