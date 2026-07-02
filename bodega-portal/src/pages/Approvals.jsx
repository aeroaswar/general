import { Check, RotateCcw, CheckCircle2 } from "lucide-react";
import { PageTitle, Card, StatusBadge, PlatformTag, Button, EmptyState } from "../ui.jsx";
import { fromNow } from "../status.js";
import { useAuth, useData } from "../store.jsx";

export default function Approvals() {
  const { me } = useAuth();
  const { store, update, logAudit } = useData();

  const rows = store.approvals
    .map((a) => ({ ...a, item: store.content.find((c) => c.id === a.contentId) }))
    .filter((a) => a.item);
  const pending = rows.filter((a) => !a.decision);
  const decided = rows.filter((a) => a.decision);
  const canDecide = me.role !== "team"; // client approves; admin can act on their behalf

  const decide = (a, decision) => {
    update("approvals", a.id, { decision, decidedAt: new Date().toISOString() });
    update("content", a.contentId, { status: decision === "approved" ? "Approved" : "Revision Requested" });
    logAudit("approval." + decision, { id: a.id });
  };

  return (
    <>
      <PageTitle kicker="Review & approve" title="Approvals" />
      {pending.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="All clear" sub="Nothing is waiting on a decision right now." />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.item.title}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <StatusBadge status={a.item.status} />
                  <PlatformTag platform={a.item.platform} />
                </div>
                {a.note && <p className="text-sm text-muted mt-2">“{a.note}”</p>}
                <p className="text-xs text-faint mono mt-1.5">requested {fromNow(a.requestedAt)}</p>
              </div>
              {canDecide && (
                <div className="flex gap-2">
                  <Button variant="orange" size="sm" onClick={() => decide(a, "approved")}><Check size={14} /> Approve</Button>
                  <Button variant="ghost" size="sm" onClick={() => decide(a, "revision")}><RotateCcw size={14} /> Request revision</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <>
          <p className="eyebrow mt-8 mb-3">Decided</p>
          <div className="flex flex-col gap-2">
            {decided.map((a) => (
              <Card key={a.id} className="!p-4 flex items-center gap-3 text-sm">
                <span className="chip" style={{ color: a.decision === "approved" ? "#0f9d58" : "#d6336c" }}>{a.decision}</span>
                <span className="font-medium truncate">{a.item.title}</span>
                <span className="mono text-xs text-faint ml-auto">{fromNow(a.decidedAt)}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
