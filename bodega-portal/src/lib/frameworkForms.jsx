// Shared add/edit forms for a project's framework (phases · pillars · audience).
// Used by both the Project hub and the Contract's Statement of Work so the two
// stay in lock-step. Each form takes { data, ctx, close } where ctx carries the
// active project + the relevant CRUD functions.
import { useState } from "react";
import { Button } from "./ui.jsx";
import { Field, Input, Textarea } from "./forms.jsx";

export function Foot({ close, save, disabled, label }) {
  return (
    <div className="flex justify-end gap-2 mt-2 sm:col-span-2">
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button onClick={save} disabled={disabled}>{label}</Button>
    </div>
  );
}

export function PhaseForm({ data, ctx, close }) {
  const [f, setF] = useState({ name: data?.name || "", objective: data?.objective || "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.name.trim()) return; const patch = { name: f.name.trim(), objective: f.objective.trim() }; if (data) ctx.updatePhase(data.id, patch); else ctx.addPhase(ctx.project.id, patch); close(); };
  return (
    <div className="grid gap-4">
      <Field label="Phase name"><Input value={f.name} onChange={set("name")} placeholder="e.g. Foundation" /></Field>
      <Field label="Objective"><Textarea value={f.objective} onChange={set("objective")} placeholder="What this phase achieves" /></Field>
      <Foot close={close} save={save} disabled={!f.name.trim()} label={data ? "Save phase" : "Add phase"} />
    </div>
  );
}

export function PillarForm({ data, ctx, close }) {
  const [f, setF] = useState({ name: data?.name || "", description: data?.description || "", weight: data?.weight ?? 25 });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.name.trim()) return; const patch = { name: f.name.trim(), description: f.description.trim(), weight: Number(f.weight) || 0 }; if (data) ctx.updatePillar(data.id, patch); else ctx.addPillar(ctx.project.id, patch); close(); };
  return (
    <div className="grid gap-4">
      <Field label="Pillar name"><Input value={f.name} onChange={set("name")} placeholder="e.g. Education" /></Field>
      <Field label="Description"><Textarea value={f.description} onChange={set("description")} placeholder="What this pillar covers" /></Field>
      <Field label="Target weight (%)"><Input type="number" min="0" max="100" value={f.weight} onChange={set("weight")} /></Field>
      <Foot close={close} save={save} disabled={!f.name.trim()} label={data ? "Save pillar" : "Add pillar"} />
    </div>
  );
}

export function SegmentForm({ data, ctx, close }) {
  const [f, setF] = useState({ name: data?.name || "", description: data?.description || "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.name.trim()) return; const patch = { name: f.name.trim(), description: f.description.trim() }; if (data) ctx.updateSegment(data.id, patch); else ctx.addSegment(ctx.project.id, patch); close(); };
  return (
    <div className="grid gap-4">
      <Field label="Segment name"><Input value={f.name} onChange={set("name")} placeholder="e.g. First-time pilgrims" /></Field>
      <Field label="Description"><Textarea value={f.description} onChange={set("description")} placeholder="Who they are" /></Field>
      <Foot close={close} save={save} disabled={!f.name.trim()} label={data ? "Save segment" : "Add segment"} />
    </div>
  );
}

// Convenience: the modal-ready form for a given kind.
export function FrameworkForm({ kind, data, ctx, close }) {
  if (kind === "phase") return <PhaseForm data={data} ctx={ctx} close={close} />;
  if (kind === "pillar") return <PillarForm data={data} ctx={ctx} close={close} />;
  if (kind === "segment") return <SegmentForm data={data} ctx={ctx} close={close} />;
  return null;
}

export const frameworkTitle = (kind, data) => ({
  phase: data ? "Edit phase" : "New phase",
  pillar: data ? "Edit pillar" : "New pillar",
  segment: data ? "Edit audience segment" : "New audience segment",
}[kind]);
