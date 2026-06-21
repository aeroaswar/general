import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronRight, MessageSquare, Send, Check, RotateCcw, CalendarClock, CalendarPlus, History, PenLine, X } from "lucide-react";
import { useData, useActiveProject, useProjectContent, useCurrentUser, userById } from "../store.jsx";
import { STAGES, STATUSES, STATUS_META, NEXT_STATUS, checkMove, fmtDate, fromNow } from "../lib/status.js";
import { Button, Card, StatusBadge, PlatformTag, Avatar, Modal, PageTitle, cx } from "../lib/ui.jsx";

const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "YouTube", "X", "Newsletter", "Web"];

export default function ContentBoard() {
  const project = useActiveProject();
  const content = useProjectContent();
  const { addContentItem, pillars, campaigns, users } = useData();
  const me = useCurrentUser();
  const isStaff = me.role === "admin" || me.role === "team";

  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  const byStage = useMemo(() => {
    const m = Object.fromEntries(STAGES.map((s) => [s.key, []]));
    content.forEach((c) => { const st = STAGES.find((s) => s.statuses.includes(c.status)); if (st) m[st.key].push(c); });
    Object.values(m).forEach((arr) => arr.sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status)));
    return m;
  }, [content]);

  const open = content.find((c) => c.id === openId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageTitle kicker={project?.name || "Workflow"} title="Content Board">
        {isStaff && project && <Button onClick={() => setAdding(true)}><Plus size={17} /> New content</Button>}
      </PageTitle>

      <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map((stage, i) => {
          const items = byStage[stage.key];
          return (
            <div key={stage.key} className="min-w-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: stage.c }} />
                <span className="font-semibold text-sm">{stage.label}</span>
                <span className="ml-auto text-xs text-faint tabular-nums">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((c) => (
                  <button key={c.id} onClick={() => setOpenId(c.id)} className="text-left">
                    <Card className="!p-3.5 hover:border-[color:var(--line-2)] transition-colors">
                      <div className="mb-1.5"><StatusBadge status={c.status} /></div>
                      <p className="font-medium text-sm leading-snug">{c.title}</p>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{c.hook}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <PlatformTag platform={c.platform} />
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-faint"><CalendarClock size={13} />{fmtDate(c.publishDate)}</span>
                        <Avatar name={userById(c.ownerId)?.name || ""} size={20} />
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
      <AddModal open={adding} onClose={() => setAdding(false)} project={project}
        users={users}
        pillars={pillars.filter((p) => p.projectId === project?.id)}
        campaigns={campaigns.filter((c) => c.projectId === project?.id)}
        onAdd={addContentItem} />
    </motion.div>
  );
}

function ContentModal({ item, onClose }) {
  const { comments, addComment, addApproval, updateContentStatus, updateContentItem, requestClientReview, scheduleContent, assets, approvals, audit, pillars, campaigns, users } = useData();
  const me = useCurrentUser();
  const [note, setNote] = useState("");
  const [schedDate, setSchedDate] = useState("");
  const [draft, setDraft] = useState(null); // edit form state (null = view mode)
  if (!item) return null;

  const isStaff = me.role === "admin" || me.role === "team";
  const thread = comments.filter((c) => c.contentItemId === item.id);
  const nexts = NEXT_STATUS[item.status] || [];
  const hasAssets = assets.some((a) => a.projectId === item.projectId);
  const canReview = me.role === "client" && item.status === "Client Review";
  const canRequestReview = isStaff && item.status === "Internal Review";
  const showSchedule = isStaff && ["Approved", "Scheduled"].includes(item.status);
  const projPillars = pillars.filter((p) => p.projectId === item.projectId);
  const projCampaigns = campaigns.filter((c) => c.projectId === item.projectId);
  const timeline = [
    ...approvals.filter((a) => a.contentItemId === item.id).map((a) => ({ id: a.id, ts: a.timestamp, who: userById(a.actorId)?.name, text: a.action === "approved" ? "approved" : a.action === "revision_requested" ? "requested changes" : "commented", note: a.note })),
    ...audit.filter((a) => a.entityId === item.id && (a.action === "status" || a.action === "schedule")).map((a) => ({ id: a.id, ts: a.ts, who: userById(a.actorId)?.name, text: a.action === "schedule" ? `scheduled for ${fmtDate(a.to)}` : `moved ${a.from} → ${a.to}`, note: a.reason })),
  ].sort((x, y) => y.ts.localeCompare(x.ts)).slice(0, 8);

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const saveEdit = () => {
    updateContentItem(item.id, {
      title: draft.title, hook: draft.hook, brief: draft.brief, cta: draft.cta, platform: draft.platform,
      format: draft.format, pillarId: draft.pillarId, campaignId: draft.campaignId || undefined,
      ownerId: draft.ownerId, deadline: draft.deadline, publishDate: draft.publishDate,
    });
    setDraft(null);
  };

  return (
    <Modal open={!!item} onClose={onClose} title={draft ? "Edit content" : item.title} width={620}>
      {draft ? (
        <div className="flex flex-col gap-3">
          <L label="Title"><input className="input-glass" value={draft.title} onChange={set("title")} /></L>
          <L label="Hook"><input className="input-glass" value={draft.hook} onChange={set("hook")} /></L>
          <L label="Brief"><textarea className="input-glass" rows={3} value={draft.brief} onChange={set("brief")} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L label="CTA"><input className="input-glass" value={draft.cta} onChange={set("cta")} /></L>
            <L label="Format"><input className="input-glass" value={draft.format} onChange={set("format")} /></L>
            <L label="Platform"><select className="input-glass" value={draft.platform} onChange={set("platform")}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></L>
            <L label="Owner"><select className="input-glass" value={draft.ownerId} onChange={set("ownerId")}>{users.filter((u) => u.role !== "client").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></L>
            <L label="Pillar"><select className="input-glass" value={draft.pillarId} onChange={set("pillarId")}>{projPillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></L>
            <L label="Campaign"><select className="input-glass" value={draft.campaignId || ""} onChange={set("campaignId")}><option value="">None</option>{projCampaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></L>
            <L label="Deadline"><input type="date" className="input-glass" value={draft.deadline || ""} onChange={set("deadline")} /></L>
            <L label="Publish date"><input type="date" className="input-glass" value={draft.publishDate || ""} onChange={set("publishDate")} /></L>
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={saveEdit}><Check size={16} /> Save</Button>
            <Button variant="ghost" onClick={() => setDraft(null)}><X size={16} /> Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge status={item.status} />
            <PlatformTag platform={item.platform} />
            <span className="chip" style={{ color: "var(--muted)" }}>{item.format}</span>
            <span className="chip" style={{ color: "var(--muted)" }}><CalendarClock size={13} /> {fmtDate(item.publishDate, "MMM d")}</span>
            {isStaff && <button onClick={() => setDraft({ ...item })} className="ml-auto chip hover:border-[color:var(--line-2)]" style={{ color: "var(--muted)" }}><PenLine size={13} /> Edit</button>}
          </div>

          <Field label="Hook">{item.hook}</Field>
          <Field label="Brief">{item.brief}</Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Owner"><span className="inline-flex items-center gap-2"><Avatar name={userById(item.ownerId)?.name || ""} size={20} /> {userById(item.ownerId)?.name}</span></Field>
            <Field label="Deadline">{fmtDate(item.deadline, "MMM d")}</Field>
            <Field label="Pillar">{projPillars.find((p) => p.id === item.pillarId)?.name || "—"}</Field>
            <Field label="Campaign">{projCampaigns.find((c) => c.id === item.campaignId)?.name || "—"}</Field>
          </div>
          {item.clientReviewMessage && item.status === "Client Review" && (
            <div className="glass-2 hairline border rounded-xl p-3 my-2 text-sm"><b className="text-accent">Review note:</b> {item.clientReviewMessage}</div>
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
                {canRequestReview && (() => {
                  const g = checkMove(item, "Client Review", { hasAssets });
                  return <Button disabled={!g.ok} title={g.ok ? "" : `Needs: ${g.missing.join(", ")}`} onClick={() => { requestClientReview(item.id, me.id, { message: note }); onClose(); }}><Send size={16} /> Request client review</Button>;
                })()}
                {nexts.filter((s) => s !== "Scheduled" && s !== "Client Review").map((s) => {
                  const g = checkMove(item, s, { hasAssets });
                  return (
                    <Button key={s} variant="ghost" disabled={!g.ok} title={g.ok ? "" : `Needs: ${g.missing.join(", ")}`} onClick={() => { updateContentStatus(item.id, s); onClose(); }}>
                      Move to {STATUS_META[s].label} <ChevronRight size={15} />
                    </Button>
                  );
                })}
              </>
            )}
          </div>

          {showSchedule && (() => {
            const date = schedDate || item.publishDate || "";
            const g = checkMove({ ...item, publishDate: date }, "Scheduled", { hasAssets });
            return (
              <div className="glass-2 hairline border rounded-xl p-3 mb-4">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><CalendarPlus size={15} className="text-accent" /> {item.status === "Scheduled" ? "Reschedule" : "Schedule"}</p>
                {!g.ok && <p className="text-xs mb-2" style={{ color: "#c97a0a" }}>Needs: {g.missing.join(", ")}.</p>}
                <div className="flex gap-2">
                  <input type="date" className="input-glass" value={date} onChange={(e) => setSchedDate(e.target.value)} />
                  <Button disabled={!g.ok} onClick={() => { scheduleContent(item.id, date); onClose(); }}>{item.status === "Scheduled" ? "Update" : "Schedule"}</Button>
                </div>
              </div>
            );
          })()}

          {timeline.length > 0 && (
            <div className="border-t hairline pt-4 mb-4">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2"><History size={15} /> Activity</p>
              <div className="flex flex-col gap-2.5">
                {timeline.map((t) => (
                  <div key={t.id} className="text-sm flex gap-2">
                    <span className="text-faint text-xs whitespace-nowrap mt-0.5 w-20 shrink-0">{fromNow(t.ts)}</span>
                    <span><b>{t.who}</b> <span className="text-muted">{t.text}</span>{t.note ? <span className="text-muted"> — “{t.note}”</span> : null}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </>
      )}
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

function AddModal({ open, onClose, project, users, pillars, campaigns, onAdd }) {
  const blank = { title: "", hook: "", platform: "Instagram", format: "Reel", pillarId: "", campaignId: "", ownerId: "u2", deadline: "", publishDate: "" };
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.title.trim() || !project) return;
    onAdd(project.id, {
      title: form.title, hook: form.hook, brief: `${form.title} — built for ${form.platform}.`,
      platform: form.platform, format: form.format, phaseId: "",
      pillarId: form.pillarId || pillars[0]?.id || "", campaignId: form.campaignId || undefined,
      ownerId: form.ownerId, deadline: form.deadline, publishDate: form.publishDate,
    });
    setForm(blank);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`New content${project ? " · " + project.name : ""}`} width={540}>
      <div className="flex flex-col gap-3">
        <L label="Title"><input className="input-glass" value={form.title} onChange={set("title")} placeholder="e.g. Umrah checklist (save this)" /></L>
        <L label="Hook"><input className="input-glass" value={form.hook} onChange={set("hook")} placeholder="The first line that stops the scroll" /></L>
        <div className="grid grid-cols-2 gap-3">
          <L label="Platform"><select className="input-glass" value={form.platform} onChange={set("platform")}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></L>
          <L label="Format"><input className="input-glass" value={form.format} onChange={set("format")} placeholder="Reel / Carousel…" /></L>
          <L label="Owner"><select className="input-glass" value={form.ownerId} onChange={set("ownerId")}>{users.filter((u) => u.role !== "client").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></L>
          <L label="Pillar"><select className="input-glass" value={form.pillarId} onChange={set("pillarId")}>{pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></L>
          <L label="Campaign"><select className="input-glass" value={form.campaignId} onChange={set("campaignId")}><option value="">None</option>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></L>
          <L label="Deadline"><input type="date" className="input-glass" value={form.deadline} onChange={set("deadline")} /></L>
        </div>
        <Button className="mt-2" onClick={submit}><Plus size={16} /> Add to board</Button>
      </div>
    </Modal>
  );
}

function L({ label, children }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-muted">{label}</span>{children}</label>;
}
