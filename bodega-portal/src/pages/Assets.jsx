import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Image, Video, FileText, Music, Upload, Plus, Check, Clock } from "lucide-react";
import { useData, useActiveProject, useCurrentUser, userById } from "../store.jsx";
import { fmtDate, fromNow } from "../lib/status.js";
import { Card, Button, Badge, Modal, PageTitle, EmptyState, cx, fadeUp } from "../lib/ui.jsx";

const TYPE_ICON = { image: Image, video: Video, doc: FileText, audio: Music };
const REQ_C = { Requested: "#c97a0a", "In Progress": "#e8743b", Uploaded: "#0f9d58", Cancelled: "#8a8f98" };

export default function Assets() {
  const { assets, assetRequests, uploadAsset, addAssetRequest } = useData();
  const project = useActiveProject();
  const visible = project ? [project] : [];
  const me = useCurrentUser();
  const [tab, setTab] = useState("library");
  const [uploadFor, setUploadFor] = useState(null); // request being fulfilled, or {} for free upload
  const [requesting, setRequesting] = useState(false);

  const library = useMemo(() => assets.filter((a) => a.projectId === project?.id), [assets, project]);
  const requests = useMemo(() => assetRequests.filter((r) => r.projectId === project?.id), [assetRequests, project]);

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={project?.name || "Files"} title="Assets">
        <div className="flex items-center gap-2">
          {(me.role === "admin" || me.role === "team") && <Button variant="ghost" onClick={() => setRequesting(true)}><Plus size={16} /> Request</Button>}
          <Button onClick={() => setUploadFor({})}><Upload size={16} /> Upload</Button>
        </div>
      </PageTitle>

      <div className="flex gap-2 mb-5">
        {["library", "requests"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("chip capitalize", tab === t && "!border-transparent")} style={tab === t ? { background: "#e8743b1a", color: "#e8743b", borderColor: "#e8743b88" } : { color: "var(--muted)" }}>
            {t} · {t === "library" ? library.length : requests.length}
          </button>
        ))}
      </div>

      {tab === "library" ? (
        library.length === 0 ? <EmptyState icon={Image} title="No assets yet" sub="Uploaded files will appear here." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {library.map((a) => {
              const Icon = TYPE_ICON[a.type] || FileText;
              return (
                <Card key={a.id} hover className="flex items-center gap-4">
                  <span className="w-12 h-12 grid place-items-center rounded-xl shrink-0" style={{ background: "#e8743b14", color: "#e8743b" }}><Icon size={20} /></span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted">{a.size} · {a.type}</p>
                    <p className="text-[11px] text-faint mt-0.5">{userById(a.uploadedBy)?.name} · {fromNow(a.uploadedAt)}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        requests.length === 0 ? <EmptyState icon={Clock} title="No requests" sub="Asset requests from the team appear here." /> : (
          <div className="flex flex-col gap-3">
            {requests.map((r) => (
              <Card key={r.id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="font-medium">{r.title}</p><Badge color={REQ_C[r.status]}>{r.status}</Badge></div>
                  {r.description && <p className="text-sm text-muted mt-0.5">{r.description}</p>}
                  <p className="text-[11px] text-faint mt-1">{project?.name} · due {fmtDate(r.dueDate)}</p>
                </div>
                {["Requested", "In Progress"].includes(r.status) && (
                  <Button variant="ghost" size="sm" onClick={() => setUploadFor(r)}><Upload size={15} /> Fulfill</Button>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      <UploadModal open={!!uploadFor} request={uploadFor} onClose={() => setUploadFor(null)} projects={visible} me={me} uploadAsset={uploadAsset} />
      <RequestModal open={requesting} onClose={() => setRequesting(false)} projects={visible} me={me} addRequest={addAssetRequest} />
    </motion.div>
  );
}

function UploadModal({ open, request, onClose, projects, me, uploadAsset }) {
  const [form, setForm] = useState({ name: "", type: "image" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = () => {
    const projectId = request?.projectId || projects[0]?.id;
    if (!form.name.trim() || !projectId) return;
    uploadAsset({ projectId, name: form.name, type: request?.type || form.type, uploadedBy: me.id, size: form.size || "—", assetRequestId: request?.id });
    setForm({ name: "", type: "image" }); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={request?.id ? `Fulfill: ${request.title}` : "Upload asset"} width={460}>
      <div className="flex flex-col gap-3">
        <L label="File name"><input className="input-glass" value={form.name} onChange={set("name")} placeholder="e.g. madinah-bts.mp4" /></L>
        {!request?.id && (
          <L label="Type"><select className="input-glass" value={form.type} onChange={set("type")}>{["image", "video", "doc", "audio"].map((t) => <option key={t}>{t}</option>)}</select></L>
        )}
        <L label="Size (optional)"><input className="input-glass" value={form.size || ""} onChange={set("size")} placeholder="e.g. 12 MB" /></L>
        <Button className="mt-2" onClick={submit}><Check size={16} /> {request?.id ? "Mark uploaded" : "Upload"}</Button>
        <p className="text-xs text-faint text-center">Demo upload — no file leaves your browser.</p>
      </div>
    </Modal>
  );
}

function RequestModal({ open, onClose, projects, me, addRequest }) {
  const [form, setForm] = useState({ projectId: "", title: "", description: "", type: "image" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = () => {
    const projectId = form.projectId || projects[0]?.id;
    if (!form.title.trim() || !projectId) return;
    addRequest({ projectId, title: form.title, description: form.description, type: form.type, requestedBy: me.id });
    setForm({ projectId: "", title: "", description: "", type: "image" }); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Request an asset" width={460}>
      <div className="flex flex-col gap-3">
        <L label="Project"><select className="input-glass" value={form.projectId || projects[0]?.id} onChange={set("projectId")}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></L>
        <L label="What do you need?"><input className="input-glass" value={form.title} onChange={set("title")} placeholder="e.g. Raw team footage" /></L>
        <L label="Details"><input className="input-glass" value={form.description} onChange={set("description")} placeholder="Optional context" /></L>
        <L label="Type"><select className="input-glass" value={form.type} onChange={set("type")}>{["image", "video", "doc", "audio"].map((t) => <option key={t}>{t}</option>)}</select></L>
        <Button className="mt-2" onClick={submit}><Plus size={16} /> Create request</Button>
      </div>
    </Modal>
  );
}

function L({ label, children }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold text-muted">{label}</span>{children}</label>;
}
