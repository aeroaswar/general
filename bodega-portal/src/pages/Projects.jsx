import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layers, Users, Megaphone, FolderKanban, ArrowUpRight, Compass, Plus, Pencil, Trash2 } from "lucide-react";
import { useData, useVisibleProjects, useActiveProject, useProjectContent, useSelectedClient, useCurrentUser } from "../store.jsx";
import { PROJECT_STATUS_C, BOARD_COLUMNS, STATUS_META, fmtDate } from "../lib/status.js";
import { Card, Badge, Button, Progress, PageTitle, PlatformTag, EmptyState, Modal, fadeUp, cx } from "../lib/ui.jsx";
import { Field, Input, Select, toList, fromList } from "../lib/forms.jsx";
import { Foot, PhaseForm, PillarForm, SegmentForm } from "../lib/frameworkForms.jsx";

const PROJECT_STATUSES = ["Planning", "Active", "Paused", "Closed"];

// The Project hub — overview + framework, now fully editable (studio roles).
export default function Projects() {
  const projects = useVisibleProjects();
  const project = useActiveProject();
  const content = useProjectContent();
  const client = useSelectedClient();
  const me = useCurrentUser();
  const canEdit = me.role !== "client";
  const {
    phases, pillars, audienceSegments, selectedProjectId, setSelectedProjectId,
    addProject, updateProject, deleteProject,
    addPhase, updatePhase, deletePhase,
    addPillar, updatePillar, deletePillar,
    addSegment, updateSegment, deleteSegment,
  } = useData();

  const [editor, setEditor] = useState(null); // { kind, data }
  const ctx = { project, clientId: client?.id, addProject, updateProject, addPhase, updatePhase, addPillar, updatePillar, addSegment, updateSegment };

  const data = useMemo(() => {
    if (!project) return null;
    const items = content;
    const total = items.length || 1;
    return {
      phases: phases.filter((x) => x.projectId === project.id).sort((a, b) => a.order - b.order),
      pillars: pillars.filter((x) => x.projectId === project.id).map((pl) => ({ ...pl, actual: Math.round((items.filter((c) => c.pillarId === pl.id).length / total) * 100) })),
      segments: audienceSegments.filter((x) => x.projectId === project.id),
      counts: BOARD_COLUMNS.map((s) => ({ s, n: items.filter((c) => c.status === s).length })).filter((x) => x.n),
    };
  }, [project, phases, pillars, audienceSegments, content]);

  const newProject = () => {
    const p = addProject(client.id, { name: `${client.name} project`, industry: client.industry });
    setSelectedProjectId(p.id);
    setEditor({ kind: "project", data: p });
  };

  if (!project) {
    return (
      <motion.div {...fadeUp}>
        <PageTitle kicker={client?.name || "Project"} title="Projects">
          {canEdit && client && <Button onClick={newProject}><Plus size={16} /> New project</Button>}
        </PageTitle>
        <EmptyState icon={FolderKanban} title="No projects yet" sub={canEdit ? "Create the first project for this client." : "This client has no projects yet."} />
        <Editor editor={editor} close={() => setEditor(null)} ctx={ctx} />
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Project" title={project.name}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={PROJECT_STATUS_C[project.status]}>{project.status}</Badge>
          {canEdit && <>
            <Button variant="ghost" size="sm" onClick={() => setEditor({ kind: "project", data: project })}><Pencil size={14} /> Edit</Button>
            <Button size="sm" onClick={newProject}><Plus size={14} /> New</Button>
          </>}
        </div>
      </PageTitle>

      {/* project switcher */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
              className={cx("chip", p.id === selectedProjectId && "!border-transparent")}
              style={p.id === selectedProjectId ? { background: "#e8743b1a", color: "#e8743b", borderColor: "#e8743b88" } : { color: "var(--muted)" }}>
              <i className="w-1.5 h-1.5 rounded-full" style={{ background: PROJECT_STATUS_C[p.status] }} />{p.name}
            </button>
          ))}
        </div>
      )}

      {/* overview */}
      <Card className="mb-4">
        <div className="grid sm:grid-cols-4 gap-4">
          <Meta label="Industry" value={project.industry || "—"} />
          <Meta label="Cadence" value={project.cadence || "—"} />
          <Meta label="Timeline" value={`${fmtDate(project.startDate)} – ${fmtDate(project.endDate)}`} />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-faint mb-1.5">Health</p>
            <div className="flex items-center gap-2"><div className="flex-1"><Progress value={project.health} /></div><span className="text-sm font-semibold tabular-nums">{project.health}</span></div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-5 border-t hairline">
          <Meta label="Business goal" value={project.goalBusiness || "—"} />
          <Meta label="Marketing goal" value={project.goalMarketing || "—"} />
          <Meta label="Campaign goal" value={project.goalCampaign || "—"} />
        </div>
        {project.platforms?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-4">{project.platforms.map((p) => <PlatformTag key={p} platform={p} />)}</div>}
        {canEdit && (
          <div className="mt-4 pt-4 border-t hairline">
            <button onClick={() => { if (confirm(`Delete project "${project.name}" and all its content?`)) deleteProject(project.id); }} className="text-xs text-muted hover:text-[#d6336c] inline-flex items-center gap-1.5"><Trash2 size={13} /> Delete project</button>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* phases */}
        <Card>
          <SectionHead icon={Layers} title="Framework — phases" canEdit={canEdit} onAdd={() => setEditor({ kind: "phase", data: null })} />
          <div className="relative pl-6">
            <span className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: "var(--line-2)" }} />
            <div className="flex flex-col gap-5">
              {data.phases.map((ph) => (
                <div key={ph.id} className="relative group">
                  <span className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full border-2" style={{ background: "var(--card)", borderColor: "#e8743b" }} />
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-semibold">{ph.name}</p><p className="text-sm text-muted">{ph.objective || "—"}</p></div>
                    {canEdit && <RowActions onEdit={() => setEditor({ kind: "phase", data: ph })} onDelete={() => deletePhase(ph.id)} />}
                  </div>
                </div>
              ))}
              {data.phases.length === 0 && <p className="text-sm text-muted">No phases yet.</p>}
            </div>
          </div>
        </Card>

        {/* pillars target vs actual */}
        <Card>
          <SectionHead icon={Megaphone} title="Pillars — target vs actual" canEdit={canEdit} onAdd={() => setEditor({ kind: "pillar", data: null })} />
          <div className="flex flex-col gap-4">
            {data.pillars.map((pl) => (
              <div key={pl.id} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium flex items-center gap-1.5">{pl.name}
                    {canEdit && <RowActions onEdit={() => setEditor({ kind: "pillar", data: pl })} onDelete={() => deletePillar(pl.id)} />}
                  </span>
                  <span className="text-muted">target {pl.weight}% · actual {pl.actual}%</span>
                </div>
                <div className="relative">
                  <Progress value={pl.actual} color="linear-gradient(90deg,#e8743b,#f0a35e)" />
                  <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-[color:var(--text)]" style={{ left: `${pl.weight}%` }} title={`target ${pl.weight}%`} />
                </div>
              </div>
            ))}
            {data.pillars.length === 0 && <p className="text-sm text-muted">No pillars yet.</p>}
          </div>
          <p className="text-xs text-faint mt-4">Marker = planned weight; bar = what's actually in the pipeline.</p>
        </Card>
      </div>

      {/* audience + content summary */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <SectionHead icon={Users} title="Audience segments" canEdit={canEdit} onAdd={() => setEditor({ kind: "segment", data: null })} />
          <div className="flex flex-col gap-3">
            {data.segments.map((s) => (
              <div key={s.id} className="glass-2 hairline border rounded-xl p-3 flex items-start justify-between gap-2 group">
                <div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-muted">{s.description || "—"}</p></div>
                {canEdit && <RowActions onEdit={() => setEditor({ kind: "segment", data: s })} onDelete={() => deleteSegment(s.id)} />}
              </div>
            ))}
            {data.segments.length === 0 && <p className="text-sm text-muted">No segments yet.</p>}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="display font-bold flex items-center gap-2"><Compass size={17} className="text-accent" /> Content in pipeline</h3>
            <Link href="/app/content" className="text-sm text-muted hover:text-accent inline-flex items-center gap-1">Open board <ArrowUpRight size={15} /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.counts.length === 0 && <span className="text-sm text-muted">No content yet.</span>}
            {data.counts.map(({ s, n }) => (
              <span key={s} className="chip" style={{ color: STATUS_META[s].c }}><i className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[s].c }} />{STATUS_META[s].label} · {n}</span>
            ))}
          </div>
        </Card>
      </div>

      <Editor editor={editor} close={() => setEditor(null)} ctx={ctx} />
    </motion.div>
  );
}

function SectionHead({ icon: Icon, title, canEdit, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="display font-bold flex items-center gap-2"><Icon size={17} className="text-accent" /> {title}</h3>
      {canEdit && <button onClick={onAdd} className="text-xs text-muted hover:text-accent inline-flex items-center gap-1 font-medium"><Plus size={14} /> Add</button>}
    </div>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <span className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="p-1 rounded text-muted hover:text-[color:var(--text)]" title="Edit"><Pencil size={13} /></button>
      <button onClick={onDelete} className="p-1 rounded text-muted hover:text-[#d6336c]" title="Delete"><Trash2 size={13} /></button>
    </span>
  );
}

function Meta({ label, value }) {
  return <div><p className="text-[11px] uppercase tracking-wider text-faint mb-1.5">{label}</p><div className="text-sm font-medium">{value}</div></div>;
}

/* ── Editor modal — switches form by kind ─────────────────────────────── */
function Editor({ editor, close, ctx }) {
  if (!editor) return null;
  const { kind, data } = editor;
  const titles = { project: data ? "Edit project" : "New project", phase: data ? "Edit phase" : "New phase", pillar: data ? "Edit pillar" : "New pillar", segment: data ? "Edit audience segment" : "New audience segment" };
  return (
    <Modal open={!!editor} onClose={close} title={titles[kind]} width={kind === "project" ? 640 : 500}>
      {kind === "project" && <ProjectForm data={data} ctx={ctx} close={close} />}
      {kind === "phase" && <PhaseForm data={data} ctx={ctx} close={close} />}
      {kind === "pillar" && <PillarForm data={data} ctx={ctx} close={close} />}
      {kind === "segment" && <SegmentForm data={data} ctx={ctx} close={close} />}
    </Modal>
  );
}

function ProjectForm({ data, ctx, close }) {
  const [f, setF] = useState({
    name: data?.name || "", industry: data?.industry || "", status: data?.status || "Planning",
    cadence: data?.cadence || "", startDate: data?.startDate || "", endDate: data?.endDate || "",
    budget: data?.budget || "", health: data?.health ?? 60, platforms: fromList(data?.platforms),
    goalBusiness: data?.goalBusiness || "", goalMarketing: data?.goalMarketing || "", goalCampaign: data?.goalCampaign || "",
    successMetrics: fromList(data?.successMetrics), painPoints: fromList(data?.painPoints),
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = () => {
    if (!f.name.trim()) return;
    const patch = {
      name: f.name.trim(), industry: f.industry.trim(), status: f.status, cadence: f.cadence.trim(),
      startDate: f.startDate, endDate: f.endDate, budget: f.budget.trim(), health: Number(f.health) || 0,
      platforms: toList(f.platforms), goalBusiness: f.goalBusiness.trim(), goalMarketing: f.goalMarketing.trim(),
      goalCampaign: f.goalCampaign.trim(), successMetrics: toList(f.successMetrics), painPoints: toList(f.painPoints),
    };
    if (data) ctx.updateProject(data.id, patch); else ctx.addProject(ctx.clientId, patch);
    close();
  };
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Name" className="sm:col-span-2"><Input value={f.name} onChange={set("name")} placeholder="Project name" /></Field>
      <Field label="Industry"><Input value={f.industry} onChange={set("industry")} /></Field>
      <Field label="Status"><Select value={f.status} onChange={set("status")}>{PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
      <Field label="Start date"><Input type="date" value={f.startDate} onChange={set("startDate")} /></Field>
      <Field label="End date"><Input type="date" value={f.endDate} onChange={set("endDate")} /></Field>
      <Field label="Cadence"><Input value={f.cadence} onChange={set("cadence")} placeholder="e.g. 5×/week" /></Field>
      <Field label="Budget"><Input value={f.budget} onChange={set("budget")} placeholder="Retainer / Project" /></Field>
      <Field label="Health (0–100)"><Input type="number" min="0" max="100" value={f.health} onChange={set("health")} /></Field>
      <Field label="Platforms" hint="Comma-separated · Instagram, TikTok, LinkedIn, YouTube, Newsletter, Web"><Input value={f.platforms} onChange={set("platforms")} /></Field>
      <Field label="Business goal" className="sm:col-span-2"><Input value={f.goalBusiness} onChange={set("goalBusiness")} /></Field>
      <Field label="Marketing goal" className="sm:col-span-2"><Input value={f.goalMarketing} onChange={set("goalMarketing")} /></Field>
      <Field label="Campaign goal" className="sm:col-span-2"><Input value={f.goalCampaign} onChange={set("goalCampaign")} /></Field>
      <Field label="Success metrics" hint="Comma-separated"><Input value={f.successMetrics} onChange={set("successMetrics")} /></Field>
      <Field label="Pain points" hint="Comma-separated"><Input value={f.painPoints} onChange={set("painPoints")} /></Field>
      <Foot close={close} save={save} disabled={!f.name.trim()} label={data ? "Save changes" : "Create project"} />
    </div>
  );
}

