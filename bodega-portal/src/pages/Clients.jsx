import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Building2, Plus, Pencil, Trash2, ArrowUpRight, Target, Users } from "lucide-react";
import { useData, useVisibleClients, useCurrentUser } from "../store.jsx";
import { Card, Button, Avatar, Badge, PageTitle, Modal, EmptyState, fadeUp, cx } from "../lib/ui.jsx";
import { Field, Input, Textarea, toList, fromList } from "../lib/forms.jsx";

const BLANK = { name: "", industry: "", description: "", market: "", positioning: "", toneOfVoice: "", brandPersonality: "", competitors: "", stakeholders: "" };

export default function Clients() {
  const clients = useVisibleClients();
  const me = useCurrentUser();
  const { projects, addClient, updateClient, deleteClient, setSelectedClientId } = useData();
  const [, navigate] = useLocation();
  const [editing, setEditing] = useState(null); // null | "new" | clientObject
  const canEdit = me.role !== "client";

  const open = (client) => {
    setSelectedClientId(client.id);
    navigate("/app/projects");
  };

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Studio" title="Clients">
        {canEdit && (
          <Button onClick={() => setEditing("new")}><Plus size={16} /> New client</Button>
        )}
      </PageTitle>

      {clients.length === 0 ? (
        <EmptyState icon={Building2} title="No clients yet" sub="Add your first client to start building their workspace." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c) => {
            const projCount = projects.filter((p) => p.clientId === c.id).length;
            return (
              <Card key={c.id} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Avatar name={c.name} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[15px] truncate">{c.name}</p>
                    <p className="text-xs text-muted truncate">{c.industry || "—"}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]" title="Edit client"><Pencil size={15} /></button>
                      <button onClick={() => { if (confirm(`Delete ${c.name} and all its projects & content?`)) deleteClient(c.id); }} className="p-1.5 rounded-lg text-muted hover:text-[#d6336c] hover:bg-[color:var(--card-2)]" title="Delete client"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>

                {c.description && <p className="text-sm text-muted -mt-1">{c.description}</p>}

                <div className="flex flex-col gap-2 text-sm">
                  {c.positioning && <Row icon={Target} label="Positioning" value={c.positioning} />}
                  {c.market && <Row icon={Users} label="Market" value={c.market} />}
                </div>

                {(c.brandPersonality?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.brandPersonality.map((t) => <Badge key={t} color="#e8743b">{t}</Badge>)}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-3 border-t hairline">
                  <span className="text-xs text-faint">{projCount} project{projCount === 1 ? "" : "s"}</span>
                  <button onClick={() => open(c)} className="text-sm text-muted hover:text-accent inline-flex items-center gap-1 font-medium">Open <ArrowUpRight size={15} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ClientForm
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={(data) => {
          if (editing === "new") addClient(data); else updateClient(editing.id, data);
          setEditing(null);
        }}
      />
    </motion.div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-2">
      <Icon size={15} className="text-faint mt-0.5 shrink-0" />
      <span><span className="text-faint">{label}: </span><span className="text-[color:var(--text)]">{value}</span></span>
    </div>
  );
}

function ClientForm({ editing, onClose, onSave }) {
  const isNew = editing === "new";
  const seed = isNew || !editing ? BLANK : {
    ...BLANK, ...editing,
    brandPersonality: fromList(editing.brandPersonality),
    competitors: fromList(editing.competitors),
    stakeholders: fromList(editing.stakeholders),
  };
  const [form, setForm] = useState(seed);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // re-seed when a different client is opened for editing
  const key = isNew ? "new" : editing?.id;
  useEffect(() => { if (editing) setForm(seed); /* eslint-disable-next-line */ }, [key]);

  const submit = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(), industry: form.industry.trim(), description: form.description.trim(),
      market: form.market.trim(), positioning: form.positioning.trim(), toneOfVoice: form.toneOfVoice.trim(),
      brandPersonality: toList(form.brandPersonality), competitors: toList(form.competitors), stakeholders: toList(form.stakeholders),
    });
  };

  return (
    <Modal open={!!editing} onClose={onClose} title={isNew ? "New client" : `Edit ${editing?.name || "client"}`} width={620}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name" className="sm:col-span-2"><Input value={form.name} onChange={set("name")} placeholder="e.g. Maktour" /></Field>
        <Field label="Industry"><Input value={form.industry} onChange={set("industry")} placeholder="e.g. Travel & Hospitality" /></Field>
        <Field label="Market"><Input value={form.market} onChange={set("market")} placeholder="Who they serve" /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea value={form.description} onChange={set("description")} placeholder="One line about the client" /></Field>
        <Field label="Positioning" className="sm:col-span-2"><Input value={form.positioning} onChange={set("positioning")} placeholder="How they want to be seen" /></Field>
        <Field label="Tone of voice" className="sm:col-span-2"><Input value={form.toneOfVoice} onChange={set("toneOfVoice")} placeholder="e.g. Warm, trustworthy, aspirational" /></Field>
        <Field label="Brand personality" hint="Comma-separated"><Input value={form.brandPersonality} onChange={set("brandPersonality")} placeholder="Warm, Trustworthy, Spiritual" /></Field>
        <Field label="Competitors" hint="Comma-separated"><Input value={form.competitors} onChange={set("competitors")} placeholder="NRA, Cheria, Alhijaz" /></Field>
        <Field label="Stakeholders" hint="Comma-separated" className="sm:col-span-2"><Input value={form.stakeholders} onChange={set("stakeholders")} placeholder="Head of Marketing, Founder" /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!form.name.trim()}>{isNew ? "Create client" : "Save changes"}</Button>
      </div>
    </Modal>
  );
}
