import { useState } from "react";
import { ArrowRight, AlertCircle, Plus } from "lucide-react";
import { PageTitle, Card, StatusBadge, PlatformTag, Avatar, Button, Modal, cx } from "../ui.jsx";
import { STAGES, NEXT_STATUS, checkMove, fmtDate } from "../status.js";
import { useAuth, useData, useActiveProject, useProjectContent, uid } from "../store.jsx";

function ContentCard({ item, onOpen }) {
  const { store } = useData();
  const owner = store.users.find((u) => u.id === item.ownerId);
  return (
    <button onClick={() => onOpen(item)} className="glass-2 hairline border rounded-brand p-3 text-left w-full flex flex-col gap-2 transition-colors hover:border-[color:var(--line-2)]">
      <p className="font-semibold text-sm leading-snug">{item.title}</p>
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={item.status} />
        <PlatformTag platform={item.platform} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] mono text-faint">{item.deadline ? `due ${fmtDate(item.deadline)}` : "no deadline"}</span>
        {owner && <Avatar name={owner.name} size={22} />}
      </div>
    </button>
  );
}

function Detail({ item, onClose }) {
  const { me } = useAuth();
  const { update, add, logAudit, store } = useData();
  if (!item) return null;
  const nexts = NEXT_STATUS[item.status] || [];
  const canEdit = me.role !== "client";

  const move = (to) => {
    const { ok } = checkMove(item, to, { hasAssets: true });
    if (!ok) return;
    update("content", item.id, { status: to });
    // moving into approval opens a request the client can act on
    if (to === "Client Review" && !store.approvals.some((a) => a.contentId === item.id && !a.decision)) {
      add("approvals", { id: uid("ap"), contentId: item.id, requestedAt: new Date().toISOString(), note: "", decision: "", decidedAt: "" });
    }
    logAudit("content.status", { id: item.id, to });
  };

  return (
    <Modal open={!!item} onClose={onClose} title={item.title}>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <StatusBadge status={item.status} />
        <PlatformTag platform={item.platform} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-5">
        <div><dt className="eyebrow mb-1">Hook</dt><dd>{item.hook || "—"}</dd></div>
        <div><dt className="eyebrow mb-1">CTA</dt><dd>{item.cta || "—"}</dd></div>
        <div className="col-span-2"><dt className="eyebrow mb-1">Brief</dt><dd className="text-muted">{item.brief || "—"}</dd></div>
        <div><dt className="eyebrow mb-1">Deadline</dt><dd className="mono">{fmtDate(item.deadline)}</dd></div>
        <div><dt className="eyebrow mb-1">Publish</dt><dd className="mono">{fmtDate(item.publishDate)}</dd></div>
      </dl>
      {canEdit && nexts.length > 0 && (
        <div className="border-t hairline pt-4 flex flex-col gap-2">
          <p className="eyebrow">Advance</p>
          {nexts.map((to) => {
            const { ok, missing } = checkMove(item, to, { hasAssets: true });
            return (
              <div key={to} className="flex items-center gap-3">
                <Button size="sm" variant={ok ? "orange" : "ghost"} disabled={!ok} onClick={() => { move(to); onClose(); }}>
                  <ArrowRight size={14} /> {to}
                </Button>
                {!ok && (
                  <span className="text-xs text-muted flex items-center gap-1">
                    <AlertCircle size={13} style={{ color: "#c97a0a" }} /> missing: {missing.join(", ")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export default function Content() {
  const { me } = useAuth();
  const { add, logAudit } = useData();
  const project = useActiveProject();
  const content = useProjectContent();
  const [open, setOpen] = useState(null);

  const newIdea = () => {
    const item = {
      id: uid("ct"), projectId: project.id, campaignId: "", title: "Untitled idea",
      platform: "Instagram", status: "Idea", ownerId: "", hook: "", brief: "", cta: "",
      deadline: "", publishDate: "",
    };
    add("content", item);
    logAudit("content.create", { id: item.id });
    setOpen(item);
  };

  return (
    <>
      <PageTitle kicker={project?.name} title="Content board">
        {me.role !== "client" && (
          <Button variant="orange" onClick={newIdea}><Plus size={15} /> New idea</Button>
        )}
      </PageTitle>

      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        {STAGES.map((stage) => {
          const items = content.filter((c) => stage.statuses.includes(c.status));
          return (
            <Card key={stage.key} className={cx("!p-3 flex flex-col gap-2.5 min-h-[220px]")}>
              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-sm" style={{ color: stage.c }}>{stage.label}</span>
                <span className="mono text-xs text-faint">{items.length}</span>
              </div>
              {items.map((c) => <ContentCard key={c.id} item={c} onOpen={setOpen} />)}
              {items.length === 0 && <p className="text-xs text-faint px-1">Empty</p>}
            </Card>
          );
        })}
      </div>

      <Detail item={open} onClose={() => setOpen(null)} />
    </>
  );
}
