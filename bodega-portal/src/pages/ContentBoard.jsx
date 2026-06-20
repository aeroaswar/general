import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronRight, MessageSquare, Send, Check, RotateCcw, CalendarClock } from "lucide-react";
import { useData, useVisibleProjects, useVisibleContent, useCurrentUser, userById } from "../store.jsx";
import { BOARD_COLUMNS, STATUS_META, NEXT_STATUS, fmtDate, fromNow } from "../lib/status.js";
import { Button, Card, StatusBadge, PlatformTag, Avatar, Modal, PageTitle, cx } from "../lib/ui.jsx";

export default function ContentBoard() {
  const projects = useVisibleProjects();
  const content = useVisibleContent();
  const { updateContentStatus, addContentItem, pillars } = useData();
  const me = useCurrentUser();

  const [projectFilter, setProjectFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(
    () => content.filter((c) => projectFilter === "all" || c.projectId === projectFilter),
    [content, projectFilter]
  );
  const byCol = useMemo(() => {
    const m = Object.fromEntries(BOARD_COLUMNS.map((s) => [s, []]));
    filtered.forEach((c) => { if (m[c.status]) m[c.status].push(c); });
    return m;
  }, [filtered]);

  const open = content.find((c) => c.id === openId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTitle kicker="Workflow" title="Content Board">
        {(me.role === "admin" || me.role === "team") && (
          <Button onClick={() => setAdding(true)}><Plus size={17} /> New content</Button>
        )}
      </PageTitle>

      {/* project filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterChip active={projectFilter === "all"} onClick={() => setProjectFilter("all")}>All projects</FilterChip>
        {projects.map((p) => (
          <FilterChip key={p.id} active={projectFilter === p.id} onClick={() => setProjectFilter(p.id)}>{p.name}</FilterChip>
        ))}
      </div>

      {/* board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {BOARD_COLUMNS.map((s) => {
          const m = STATUS_META[s];
          const items = byCol[s];
          return (
            <div key={s} className="w-[280px] shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.c }} />
                <span className="font-semibold text-sm">{m.label}</span>
                <span className="ml-auto text-xs text-faint tabular-nums">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((c) => (
                  <button key={c.id} onClick={() => setOpenId(c.id)} className="text-left">
                    <Card className="!p-3.5 hover:-translate-y-0.5 transition-transform">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-snug">{c.title}</p>
                      </div>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{c.hook}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <PlatformTag platform={c.platform} />
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-faint"><CalendarClock size={13} />{fmtDate(c.publishDate)}</span>
                        <Avatar name={userById(c.ownerId)?.name || ""} size={20} color="linear-gradient(135deg,#8a76ff,#37b9ff)" />
                      </div>
                    </Card>
                  </button>
                ))}
                {items.length === 0 && <div className="text-xs text-faint px-1 py-6 text-center rounded-xl border border-dashed" style={{ borderColor: "var(--line)" }}>Empty</div>}
              </div>
            </div>
          );
        })}
      </div>

      <ContentModal item={open} onClose={() => setOpenId(null)} />
      <AddModal open={adding} onClose={() => setAdding(false)} projects={projects} pillars={pillars} onAdd={addContentItem} />
    </motion.div>
  );
}

function FilterChip({ active, children, ...rest }) {
  return (
    <button {...rest} className={cx("chip", active && "!border-transparent")} style={active ? { background: "#34e0c41f", color: "#34e0c4", borderColor: "#34e0c488" } : { color: "var(--muted)" }}>
      {children}
    </button>
  );
}

function ContentModal({ item, onClose }) {
  const { comments, addComment, addApproval, updateContentStatus, requestClientReview } = useData();
  const me = useCurrentUser();
  const [note, setNote] = useState("");
  if (!item) return null;

  const thread = comments.filter((c) => c.contentItemId === item.id);
  const nexts = NEXT_STATUS[item.status] || [];
  const canReview = me.role === "client" && item.status === "Client Review";
  const canRequestReview = (me.role === "admin" || me.role === "team") && ["Draft", "Internal Review"].includes(item.status);

  return (
    <Modal open={!!item} onClose={onClose} title={item.title} width={620}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <StatusBadge status={item.status} />
        <PlatformTag platform={item.platform} />
        <span className="chip" style={{ color: "var(--muted)" }}>{item.format}</span>
        <span className="chip" style={{ color: "var(--muted)" }}><CalendarClock size={13} /> {fmtDate(item.publishDate, "MMM d")}</span>
      </div>

      <Field label="Hook">{item.hook}</Field>
      <Field label="Brief">{item.brief}</Field>
      <Field label="CTA">{item.cta}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Owner"><span className="inline-flex items-center gap-2"><Avatar name={userById(item.ownerId)?.name || ""} size={20} /> {userById(item.ownerId)?.name}</span></Field>
        <Field label="Deadline">{fmtDate(item.deadline, "MMM d")}</Field>
      </div>
      {item.clientReviewMessage && item.status === "Client Review" && (
        <div className="glass-2 hairline border rounded-xl p-3 my-2 text-sm"><b className="text-mint">Review note:</b> {item.clientReviewMessage}</div>
      )}
      {item.performance && (
        <div className="grid grid-cols-3 gap-2 my-3">
          {[["Reach", item.performance.reach], ["Engagement", item.performance.engagement + "%"], ["Saves", item.performance.saves]].map(([k, v]) => (
            <div key={k} className="glass-2 hairline border rounded-xl p-2.5 text-center">
              <div className="display font-bold">{typeof v === "number" && v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}</div>
              <div className="text-[11px] text-faint">{k}</div>
            </div>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="flex flex-wrap gap-2 my-4">
        {canReview ? (
          <>
            <Button onClick={() => { addApproval(item.id, me.id, "approved", note); onClose(); }}><Check size={16} /> Approve</Button>
            <Button variant="danger" onClick={() => { addApproval(item.id, me.id, "revision_requested", note || "Please revise."); onClose(); }}><RotateCcw size={16} /> Request revision</Button>
          </>
        ) : (
          <>
            {canRequestReview && <Button onClick={() => { requestClientReview(item.id, me.id, { message: note }); onClose(); }}><Send size={16} /> Request client review</Button>}
            {nexts.map((s) => (
              <Button key={s} variant="ghost" onClick={() => { updateContentStatus(item.id, s); onClose(); }}>
                Move to {STATUS_META[s].label} <ChevronRight size={15} />
              </Button>
            ))}
          </>
        )}
      </div>

      {/* comments */}
      <div className="border-t hairline pt-4">
        <p className="text-sm font-semibold mb-3 flex items-center gap-2"><MessageSquare size={15} /> Comments</p>
        <div className="flex flex-col gap-3 mb-3 max-h-44 overflow-auto no-scrollbar">
          {thread.length === 0 && <p className="text-sm text-muted">No comments yet.</p>}
          {thread.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={userById(c.authorId)?.name || ""} size={26} />
              <div><p className="text-sm"><b>{userById(c.authorId)?.name}</b> <span className="text-faint text-xs">{fromNow(c.timestamp)}</span></p><p className="text-sm text-muted">{c.body}</p></div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input-glass" placeholder="Add a comment or note…" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button variant="ghost" onClick={() => { if (note.trim()) { addComment(item.id, me.id, note.trim()); setNote(""); } }}>Send</Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] uppercase tracking-wider text-faint mb-1">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function AddModal({ open, onClose, projects, pillars, onAdd }) {
  const [form, setForm] = useState({ projectId: "", title: "", hook: "", platform: "Instagram", format: "Reel", pillarId: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pid = form.projectId || projects[0]?.id;
  const projPillars = pillars.filter((p) => p.projectId === pid);

  const submit = () => {
    if (!form.title.trim() || !pid) return;
    onAdd(pid, {
      title: form.title, hook: form.hook, brief: `${form.title} — built for ${form.platform}.`,
      platform: form.platform, format: form.format, phaseId: "", pillarId: form.pillarId || projPillars[0]?.id || "",
      ownerId: "u2",
    });
    setForm({ projectId: "", title: "", hook: "", platform: "Instagram", format: "Reel", pillarId: "" });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New content" width={520}>
      <div className="flex flex-col gap-3">
        <L label="Project"><select className="input-glass" value={pid} onChange={set("projectId")}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></L>
        <L label="Title"><input className="input-glass" value={form.title} onChange={set("title")} placeholder="e.g. Umrah checklist (save this)" /></L>
        <L label="Hook"><input className="input-glass" value={form.hook} onChange={set("hook")} placeholder="The first line that stops the scroll" /></L>
        <div className="grid grid-cols-2 gap-3">
          <L label="Platform"><select className="input-glass" value={form.platform} onChange={set("platform")}>{["Instagram", "TikTok", "LinkedIn", "YouTube", "X", "Newsletter", "Web"].map((p) => <option key={p}>{p}</option>)}</select></L>
          <L label="Format"><input className="input-glass" value={form.format} onChange={set("format")} placeholder="Reel / Carousel…" /></L>
        </div>
        <L label="Pillar"><select className="input-glass" value={form.pillarId} onChange={set("pillarId")}>{projPillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></L>
        <Button className="mt-2" onClick={submit}><Plus size={16} /> Add to board</Button>
      </div>
    </Modal>
  );
}
function L({ label, children }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-muted">{label}</span>{children}</label>;
}
