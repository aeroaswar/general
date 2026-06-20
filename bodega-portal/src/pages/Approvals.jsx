import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw, Bell, ClipboardCheck, Clock } from "lucide-react";
import { useData, useVisibleContent, useVisibleProjects, useCurrentUser, userById } from "../store.jsx";
import { fmtDate, fromNow } from "../lib/status.js";
import { Card, Button, StatusBadge, PlatformTag, Avatar, PageTitle, EmptyState, Badge, fadeUp } from "../lib/ui.jsx";

export default function Approvals() {
  const content = useVisibleContent();
  const projects = useVisibleProjects();
  const { approvals, addApproval, sendReminder } = useData();
  const me = useCurrentUser();
  const projName = (id) => projects.find((p) => p.id === id)?.name || "";

  const queue = useMemo(
    () => content.filter((c) => c.status === "Client Review")
      .sort((a, b) => (a.clientReviewDue || "").localeCompare(b.clientReviewDue || "")),
    [content]
  );

  const history = useMemo(() => {
    const cById = Object.fromEntries(content.map((c) => [c.id, c]));
    return approvals.filter((a) => cById[a.contentItemId] && a.action !== "comment")
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 8)
      .map((a) => ({ ...a, item: cById[a.contentItemId] }));
  }, [approvals, content]);

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Client review" title="Approvals">
        <Badge color="#f5b14a">{queue.length} awaiting</Badge>
      </PageTitle>

      {queue.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="You're all caught up" sub="No content is waiting for client review right now." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {queue.map((c) => (
            <ApprovalCard key={c.id} item={c} project={projName(c.projectId)} me={me} onApprove={addApproval} onRemind={sendReminder} />
          ))}
        </div>
      )}

      <h3 className="display font-bold mt-8 mb-3">Decision history</h3>
      <Card className="!p-0 overflow-hidden">
        <div className="divide-y" style={{ borderColor: "var(--line)" }}>
          {history.length === 0 && <p className="text-sm text-muted p-5">No decisions yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="flex items-center gap-3 p-4">
              <span className="w-8 h-8 grid place-items-center rounded-lg shrink-0" style={{ background: h.action === "approved" ? "#34e0c422" : "#f2708b22", color: h.action === "approved" ? "#34e0c4" : "#f2708b" }}>
                {h.action === "approved" ? <Check size={16} /> : <RotateCcw size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate"><b>{userById(h.actorId)?.name}</b> <span className="text-muted">{h.action === "approved" ? "approved" : "requested changes on"}</span> {h.item.title}</p>
                {h.note && <p className="text-xs text-muted truncate">“{h.note}”</p>}
              </div>
              <span className="text-xs text-faint whitespace-nowrap">{fromNow(h.timestamp)}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function ApprovalCard({ item, project, me, onApprove, onRemind }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const canDecide = me.role === "client";
  const overdue = item.clientReviewDue && item.clientReviewDue < new Date().toISOString().slice(0, 10);

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-mint font-semibold">{project}</p>
          <h4 className="display font-bold leading-snug">{item.title}</h4>
        </div>
        <StatusBadge status="Client Review" />
      </div>
      <p className="text-sm text-muted mt-2">{item.hook}</p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <PlatformTag platform={item.platform} />
        <span className="chip" style={{ color: "var(--muted)" }}>{item.format}</span>
        <span className="chip" style={{ color: overdue ? "#f2708b" : "var(--muted)" }}><Clock size={13} /> due {fmtDate(item.clientReviewDue, "MMM d")}{overdue ? " · overdue" : ""}</span>
      </div>
      {item.clientReviewMessage && (
        <div className="glass-2 hairline border rounded-xl p-3 mt-3 text-sm">
          <span className="inline-flex items-center gap-2 text-xs text-faint mb-1"><Avatar name={userById(item.clientReviewRequestedBy)?.name || ""} size={18} /> {userById(item.clientReviewRequestedBy)?.name} asked:</span>
          <p>{item.clientReviewMessage}</p>
        </div>
      )}

      <div className="mt-auto pt-4">
        {canDecide ? (
          <>
            <input className="input-glass mb-2" placeholder="Optional note for the team…" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onApprove(item.id, me.id, "approved", note)}><Check size={16} /> Approve</Button>
              <Button variant="danger" className="flex-1" onClick={() => onApprove(item.id, me.id, "revision_requested", note || "Please revise.")}><RotateCcw size={16} /> Revise</Button>
            </div>
          </>
        ) : (
          <Button variant="ghost" className="w-full" disabled={sent} onClick={() => { onRemind({ kind: "approval", targetId: item.id, message: "Gentle nudge to review this item.", sentBy: me.id }); setSent(true); }}>
            <Bell size={16} /> {sent ? "Reminder sent" : "Send reminder"}
          </Button>
        )}
      </div>
    </Card>
  );
}
