import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileSignature, Pencil, Send, Printer, Trash2, Plus, ShieldCheck, Building2, X, Layers, Megaphone, Users, Target, Radio } from "lucide-react";
import { useData, useSelectedClient, useCurrentUser } from "../store.jsx";
import { Card, Button, Badge, PageTitle, EmptyState, Modal, PlatformTag, fadeUp, cx } from "../lib/ui.jsx";
import { Field, Input, Textarea, Select } from "../lib/forms.jsx";
import { FrameworkForm, frameworkTitle } from "../lib/frameworkForms.jsx";
import { WORDMARK } from "../lib/brand.js";
import SignaturePad from "../components/SignaturePad.jsx";
import { tr, recital, sowIntro, fmtDateL, LANGS, defaultClauses, clausesMatchDefault } from "../lib/contractI18n.js";

const STATUS_C = { Draft: "#8a8f98", Sent: "#c97a0a", Signed: "#0f9d58" };
const addMonths = (iso, n) => { if (!iso) return ""; const d = new Date(iso); d.setMonth(d.getMonth() + Number(n || 0)); return d.toISOString().slice(0, 10); };

function LangToggle({ lang, onChange }) {
  return (
    <div className="flex gap-0.5 p-0.5 rounded-lg glass-2 hairline border" title="Contract language">
      {LANGS.map((l) => (
        <button key={l.code} onClick={() => onChange(l.code)} title={l.name}
          className={cx("px-2.5 py-1 rounded-md text-xs font-semibold transition-colors", lang === l.code ? "" : "text-muted")}
          style={lang === l.code ? { background: "var(--text)", color: "var(--bg)" } : undefined}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function Contract() {
  const client = useSelectedClient();
  const me = useCurrentUser();
  const canEdit = me.role !== "client";
  const d = useData();
  const { contracts, projects, phases, pillars, audienceSegments, createContract, updateContract, deleteContract, signContract } = d;
  const contract = contracts.find((c) => c.clientId === client?.id);
  const clientProjects = projects.filter((p) => p.clientId === client?.id);
  const [editing, setEditing] = useState(false);
  const [signParty, setSignParty] = useState(null); // "client" | "studio" | null
  const [fwEditor, setFwEditor] = useState(null);    // { kind, data } — inline framework editor

  const lang = contract?.lang || "en";
  const t = tr(lang);

  // the project this engagement covers → its framework is folded into the contract
  const project = contract ? (projects.find((p) => p.id === contract.projectId) || clientProjects[0]) : null;
  const framework = project ? {
    phases: phases.filter((x) => x.projectId === project.id).sort((a, b) => a.order - b.order),
    pillars: pillars.filter((x) => x.projectId === project.id),
    segments: audienceSegments.filter((x) => x.projectId === project.id),
  } : null;
  const fwCtx = { project, addPhase: d.addPhase, updatePhase: d.updatePhase, addPillar: d.addPillar, updatePillar: d.updatePillar, addSegment: d.addSegment, updateSegment: d.updateSegment };

  // switch contract language; if the clauses are still a standard set, swap the
  // boilerplate to the target language (custom edits are preserved untouched)
  const switchLang = (newLang) => {
    if (!contract || newLang === lang) return;
    const patch = { lang: newLang };
    if (clausesMatchDefault(contract.clauses)) {
      patch.clauses = defaultClauses(newLang).map((c, i) => ({ id: `${contract.id}-cl${i + 1}`, heading: c.heading, body: c.body }));
    }
    updateContract(contract.id, patch);
  };

  if (!client) return <EmptyState icon={Building2} title="No client selected" sub="Pick a client to view their contract." />;

  if (!contract) {
    return (
      <motion.div {...fadeUp}>
        <PageTitle kicker={client.name} title={t.pageTitle} />
        <EmptyState
          icon={FileSignature}
          title={t.noContractTitle}
          sub={canEdit ? t.noContractAdmin(client.name) : t.noContractClient}
        />
        {canEdit && (
          <div className="text-center mt-4">
            <Button onClick={() => { createContract(client.id); setEditing(true); }}><Plus size={16} /> {t.createContract}</Button>
          </div>
        )}
        <ContractEditor open={editing} contract={contracts.find((c) => c.clientId === client.id)} projects={clientProjects} onClose={() => setEditing(false)} onSave={(patch, id) => { updateContract(id, patch); setEditing(false); }} />
      </motion.div>
    );
  }

  const canSignClient = me.role === "client" || canEdit; // client signs; studio may sign on a client's behalf in-room
  return (
    <motion.div {...fadeUp}>
      <div className="no-print"><PageTitle kicker={`${client.name} · ${t.agreementWord}`} title={t.pageTitle}>
        <div className="flex flex-wrap items-center gap-2">
          <LangToggle lang={lang} onChange={switchLang} />
          <Badge color={STATUS_C[contract.status]}>{t.status[contract.status] || contract.status}</Badge>
          {canEdit && contract.status === "Draft" && <Button size="sm" onClick={() => updateContract(contract.id, { status: "Sent" })}><Send size={14} /> {t.sendToClient}</Button>}
          {canEdit && <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil size={14} /> {t.edit}</Button>}
          <Button variant="ghost" size="sm" onClick={() => window.print()}><Printer size={14} /> {t.print}</Button>
        </div>
      </PageTitle></div>

      {me.role === "client" && contract.status !== "Signed" && (
        <div className="glass p-4 mb-4 flex items-start gap-3 no-print" style={{ borderLeft: "3px solid var(--accent)" }}>
          <FileSignature size={18} className="text-accent mt-0.5 shrink-0" />
          <p className="text-sm">{t.clientHint}</p>
        </div>
      )}

      {/* ── the document ── */}
      <Card className="print-area max-w-[860px] mx-auto !p-0">
        <table className="doc-table">
          {/* letterhead repeats at the top of every printed page (table-header-group) */}
          <thead className="print-head">
            <tr><td>
              <div className="print-letterhead" aria-hidden="true">
                <img src={WORDMARK} alt="Bodega" className="ll-logo" />
                <span className="ll-meta">{contract.studio.name}<br />{contract.studio.email} · {contract.studio.address}</span>
              </div>
            </td></tr>
          </thead>
          <tfoot className="print-foot">
            <tr><td>
              <div className="print-footer" aria-hidden="true">
                {t.confidential} — {contract.title} · {contract.studio.name} &amp; {contract.client.company || client.name}
              </div>
            </td></tr>
          </tfoot>
          <tbody><tr><td>
        <div className="p-5 sm:p-7 md:p-10 doc-body flex flex-col gap-7">
          <header className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b hairline avoid-break">
            <div>
              <p className="eyebrow mb-1.5">{t.agreement}</p>
              <h2 className="display text-2xl md:text-3xl font-semibold">{contract.title}</h2>
              <p className="text-sm text-muted mt-1">{t.between} <strong>{contract.studio.name}</strong> {t.and} <strong>{contract.client.company || client.name}</strong></p>
            </div>
            <span className="brand-logo shrink-0 no-print" style={{ height: 22, width: 84 }} />
          </header>

          <p className="text-sm leading-relaxed avoid-break">
            {recital(lang, { title: contract.title, date: fmtDateL(contract.effectiveDate, lang), studio: contract.studio.name, client: contract.client.company || client.name })}
          </p>

          {/* parties */}
          <div className="grid sm:grid-cols-2 gap-5 avoid-break">
            <Party label={t.preparedBy} info={contract.studio} fallbackName={contract.studio.name} />
            <Party label={t.clientLabel} info={contract.client} fallbackName={contract.client.company || client.name} />
          </div>

          {/* key terms */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl glass-2 hairline border avoid-break">
            <Term label={t.effectiveDate} value={fmtDateL(contract.effectiveDate, lang)} />
            <Term label={t.termLabel} value={`${contract.termMonths} ${t.months}`} />
            <Term label={t.renewsUntil} value={fmtDateL(addMonths(contract.effectiveDate, contract.termMonths), lang)} />
            <Term label={t.feeLabel} value={contract.fee || "—"} />
            <Term label={t.paymentTerms} value={contract.paymentTerms || "—"} />
            <Term label={t.cadenceLabel} value={contract.cadence || "—"} />
          </div>

          {/* scope */}
          {contract.scope && (
            <section className="avoid-break">
              <h3 className="eyebrow mb-2">{t.scope}</h3>
              <p className="text-sm leading-relaxed">{contract.scope}</p>
            </section>
          )}

          {/* deliverables */}
          {contract.deliverables?.length > 0 && (
            <section className="avoid-break">
              <h3 className="eyebrow mb-2">{t.deliverables}</h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {contract.deliverables.map((dl, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />{dl}</li>
                ))}
              </ul>
            </section>
          )}

          {/* statement of work — folded in from the linked project's framework */}
          {project && (
            <section className="flex flex-col gap-6 pt-5 border-t hairline">
              <div>
                <h3 className="eyebrow mb-1">{t.statementOfWork}</h3>
                <p className="text-sm">{sowIntro(lang, `${project.name}${project.industry ? ` · ${project.industry}` : ""}`)}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 avoid-break">
                <div>
                  <p className="eyebrow mb-2 flex items-center gap-1.5"><Radio size={13} className="text-accent" /> {t.channels}</p>
                  {project.platforms?.length ? <div className="flex flex-wrap gap-1.5">{project.platforms.map((p) => <PlatformTag key={p} platform={p} />)}</div> : <p className="text-sm text-muted">—</p>}
                </div>
                <div>
                  <p className="eyebrow mb-2">{t.cadenceLabel}</p>
                  <p className="text-sm">{project.cadence || contract.cadence || "—"}</p>
                </div>
              </div>

              {(project.goalBusiness || project.goalMarketing || project.goalCampaign || project.successMetrics?.length > 0) && (
                <div className="avoid-break">
                  <p className="eyebrow mb-2 flex items-center gap-1.5"><Target size={13} className="text-accent" /> {t.goalsKpis}</p>
                  <ul className="text-sm flex flex-col gap-1.5">
                    {project.goalBusiness && <li><span className="text-faint">{t.business} — </span>{project.goalBusiness}</li>}
                    {project.goalMarketing && <li><span className="text-faint">{t.marketing} — </span>{project.goalMarketing}</li>}
                    {project.goalCampaign && <li><span className="text-faint">{t.campaign} — </span>{project.goalCampaign}</li>}
                  </ul>
                  {project.successMetrics?.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{project.successMetrics.map((m) => <span key={m} className="chip" style={{ color: "var(--muted)" }}>{m}</span>)}</div>}
                </div>
              )}

              {(framework.phases.length > 0 || canEdit) && (
                <div className="avoid-break">
                  <FwHead icon={Layers} label={t.phases} addLabel={t.add} canEdit={canEdit} onAdd={() => setFwEditor({ kind: "phase", data: null })} />
                  <ol className="flex flex-col gap-2">
                    {framework.phases.map((ph, i) => (
                      <li key={ph.id} className="text-sm flex gap-2 items-start group">
                        <span className="font-semibold shrink-0">{i + 1}.</span>
                        <span className="flex-1"><span className="font-medium">{ph.name}</span>{ph.objective ? ` — ${ph.objective}` : ""}</span>
                        {canEdit && <FwRowActions onEdit={() => setFwEditor({ kind: "phase", data: ph })} onDelete={() => d.deletePhase(ph.id)} />}
                      </li>
                    ))}
                    {framework.phases.length === 0 && <li className="text-sm text-muted">{t.noPhases}</li>}
                  </ol>
                </div>
              )}

              {(framework.pillars.length > 0 || canEdit) && (
                <div className="avoid-break">
                  <FwHead icon={Megaphone} label={t.pillars} addLabel={t.add} canEdit={canEdit} onAdd={() => setFwEditor({ kind: "pillar", data: null })} />
                  <div className="flex flex-col gap-1.5">
                    {framework.pillars.map((pl) => (
                      <div key={pl.id} className="text-sm flex items-center justify-between gap-3 group">
                        <span className="flex-1"><span className="font-medium">{pl.name}</span>{pl.description ? ` — ${pl.description}` : ""}</span>
                        <span className="text-muted shrink-0 tabular-nums">{pl.weight}%</span>
                        {canEdit && <FwRowActions onEdit={() => setFwEditor({ kind: "pillar", data: pl })} onDelete={() => d.deletePillar(pl.id)} />}
                      </div>
                    ))}
                    {framework.pillars.length === 0 && <p className="text-sm text-muted">{t.noPillars}</p>}
                  </div>
                </div>
              )}

              {(framework.segments.length > 0 || canEdit) && (
                <div className="avoid-break">
                  <FwHead icon={Users} label={t.audience} addLabel={t.add} canEdit={canEdit} onAdd={() => setFwEditor({ kind: "segment", data: null })} />
                  <div className="flex flex-col gap-1.5">
                    {framework.segments.map((s) => (
                      <div key={s.id} className="text-sm flex items-start justify-between gap-2 group">
                        <span className="flex-1"><span className="font-medium">{s.name}</span>{s.description ? ` — ${s.description}` : ""}</span>
                        {canEdit && <FwRowActions onEdit={() => setFwEditor({ kind: "segment", data: s })} onDelete={() => d.deleteSegment(s.id)} />}
                      </div>
                    ))}
                    {framework.segments.length === 0 && <p className="text-sm text-muted">{t.noSegments}</p>}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* clauses */}
          {contract.clauses?.length > 0 && (
            <section className="flex flex-col gap-4 pt-5 border-t hairline">
              <h3 className="eyebrow">{t.termsConditions}</h3>
              {contract.clauses.map((cl) => (
                <div key={cl.id} className="avoid-break">
                  <p className="font-semibold text-sm">{cl.heading}</p>
                  <p className="text-sm text-muted leading-relaxed mt-1">{cl.body}</p>
                </div>
              ))}
            </section>
          )}

          {/* signatures */}
          <section className="pt-5 border-t hairline avoid-break sig-section">
            <h3 className="eyebrow mb-4">{t.signatures}</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <SignBlock t={t} lang={lang} label={t.forClient} sig={contract.clientSignature} party={contract.client} fallbackName={contract.client.company || client.name}
                canSign={!contract.clientSignature && canSignClient} onSign={() => setSignParty("client")} />
              <SignBlock t={t} lang={lang} label={t.forBodega} sig={contract.studioSignature} party={contract.studio} fallbackName={contract.studio.name}
                canSign={!contract.studioSignature && canEdit} onSign={() => setSignParty("studio")} />
            </div>
          </section>
        </div>
          </td></tr></tbody>
        </table>
      </Card>

      {canEdit && (
        <div className="text-center mt-4 no-print">
          <button onClick={() => { if (confirm(t.deleteConfirm)) deleteContract(contract.id); }} className="text-xs text-muted hover:text-[#d6336c] inline-flex items-center gap-1.5"><Trash2 size={13} /> {t.deleteContract}</button>
        </div>
      )}

      <SignModal party={signParty} contract={contract} me={me} t={t} onClose={() => setSignParty(null)}
        onSign={(sig) => { signContract(contract.id, signParty, sig); setSignParty(null); }} />
      <ContractEditor open={editing} contract={contract} projects={clientProjects} onClose={() => setEditing(false)} onSave={(patch, id) => { updateContract(id, patch); setEditing(false); }} />
      <Modal open={!!fwEditor} onClose={() => setFwEditor(null)} title={fwEditor ? frameworkTitle(fwEditor.kind, fwEditor.data) : ""} width={500}>
        {fwEditor && <FrameworkForm kind={fwEditor.kind} data={fwEditor.data} ctx={fwCtx} close={() => setFwEditor(null)} />}
      </Modal>
    </motion.div>
  );
}

function Party({ label, info, fallbackName }) {
  return (
    <div className="glass-2 hairline border rounded-xl p-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className="font-semibold">{info.company || info.name || fallbackName}</p>
      {info.signatory && <p className="text-sm">{info.signatory}{info.title ? ` · ${info.title}` : ""}</p>}
      {info.email && <p className="text-xs text-muted mt-1">{info.email}</p>}
      {info.address && <p className="text-xs text-muted mt-1 leading-relaxed">{info.address}</p>}
    </div>
  );
}

function Term({ label, value }) {
  return <div><p className="text-[10px] uppercase tracking-[0.16em] text-faint mb-1">{label}</p><p className="text-sm font-medium">{value}</p></div>;
}

function FwHead({ icon: Icon, label, addLabel = "Add", canEdit, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="eyebrow flex items-center gap-1.5"><Icon size={13} className="text-accent" /> {label}</p>
      {canEdit && <button onClick={onAdd} className="no-print text-xs text-muted hover:text-accent inline-flex items-center gap-1 font-medium"><Plus size={13} /> {addLabel}</button>}
    </div>
  );
}

function FwRowActions({ onEdit, onDelete }) {
  return (
    <span className="no-print flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="p-1 rounded text-muted hover:text-[color:var(--text)]" title="Edit"><Pencil size={12} /></button>
      <button onClick={onDelete} className="p-1 rounded text-muted hover:text-[#d6336c]" title="Delete"><Trash2 size={12} /></button>
    </span>
  );
}

function SignBlock({ t, lang, label, sig, party, fallbackName, canSign, onSign }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="rounded-lg px-3 pt-3 pb-1.5 flex items-end justify-center" style={{ background: "#faf8f5", minHeight: 84, borderBottom: "2px solid rgba(0,0,0,.22)" }}>
        {sig ? (
          sig.drawnDataUrl
            ? <img src={sig.drawnDataUrl} alt="signature" style={{ maxHeight: 70, maxWidth: "100%" }} />
            : <span style={{ fontFamily: '"Fraunces Variable", Fraunces, cursive', fontStyle: "italic", fontSize: 30, color: "#15120f", lineHeight: 1 }}>{sig.typed || sig.name}</span>
        ) : canSign ? (
          <Button size="sm" variant="ghost" onClick={onSign} className="no-print mb-1"><Pencil size={14} /> {t.signHere}</Button>
        ) : (
          <span className="text-sm" style={{ color: "#9b948c" }}>{t.awaiting}</span>
        )}
      </div>
      <p className="font-semibold text-sm mt-2">{sig?.name || party.signatory || fallbackName}</p>
      <p className="text-xs text-muted">{sig?.title || party.title || ""}</p>
      {sig && <p className="text-xs text-faint mt-1 inline-flex items-center gap-1"><ShieldCheck size={12} style={{ color: "#0f9d58" }} /> {t.signedElectronically} · {fmtDateL(sig.date, lang)}</p>}
    </div>
  );
}

/* ── Sign modal — typed or drawn e-signature ──────────────────────────── */
function SignModal({ party, contract, me, t, onClose, onSign }) {
  const info = party === "client" ? contract?.client : contract?.studio;
  const [mode, setMode] = useState("type");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [typed, setTyped] = useState("");
  const [agree, setAgree] = useState(false);
  const padRef = useRef(null);

  useEffect(() => {
    if (party) {
      const n = me.role === "client" && party === "client" ? me.name : info?.signatory || "";
      setName(n); setTitle(info?.title || ""); setTyped(n); setAgree(false); setMode("type");
    }
  }, [party]); // eslint-disable-line

  const submit = () => {
    if (!name.trim() || !agree) return;
    const drawn = mode === "draw" ? padRef.current?.toDataURL() : null;
    const typedVal = mode === "type" ? (typed.trim() || name.trim()) : null;
    if (mode === "draw" && !drawn) return;
    onSign({ name: name.trim(), title: title.trim(), typed: typedVal || undefined, drawnDataUrl: drawn || undefined });
  };

  const ready = name.trim() && agree && (mode === "type" ? (typed.trim() || name.trim()) : true);

  return (
    <Modal open={!!party} onClose={onClose} title={party === "client" ? t.signAsClient : t.signAsBodega} width={560}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t.fullName}><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.fullName} /></Field>
        <Field label={t.title}><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.title} /></Field>
      </div>

      <div className="flex gap-1 mt-4 p-1 rounded-xl glass-2 hairline border w-fit">
        {[["type", t.type], ["draw", t.draw]].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={cx("px-4 py-1.5 rounded-lg text-sm font-medium transition-colors", mode === k ? "" : "text-muted")}
            style={mode === k ? { background: "var(--text)", color: "var(--bg)" } : undefined}>{l}</button>
        ))}
      </div>

      <div className="mt-3">
        {mode === "type" ? (
          <div>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={t.typeSignature} />
            <div className="mt-2 rounded-lg grid place-items-center" style={{ background: "#faf8f5", minHeight: 84 }}>
              <span style={{ fontFamily: '"Fraunces Variable", Fraunces, cursive', fontStyle: "italic", fontSize: 32, color: "#15120f" }}>{typed || name || t.yourSignature}</span>
            </div>
          </div>
        ) : (
          <div>
            <SignaturePad ref={padRef} placeholder={t.drawHint} />
            <button onClick={() => padRef.current?.clear()} className="text-xs text-muted hover:text-[color:var(--text)] mt-2 inline-flex items-center gap-1"><X size={12} /> {t.clear}</button>
          </div>
        )}
      </div>

      <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#e8743b]" />
        <span className="text-sm text-muted">{t.consent}</span>
      </label>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
        <Button onClick={submit} disabled={!ready}><ShieldCheck size={16} /> {t.signAgreement}</Button>
      </div>
    </Modal>
  );
}

/* ── Contract editor (studio) ─────────────────────────────────────────── */
const seedForm = (c) => ({
  title: c?.title || "", projectId: c?.projectId || "", effectiveDate: c?.effectiveDate || "", termMonths: c?.termMonths ?? 6,
  fee: c?.fee || "", paymentTerms: c?.paymentTerms || "", cadence: c?.cadence || "", scope: c?.scope || "",
  deliverables: (c?.deliverables || []).join("\n"),
  studioSignatory: c?.studio?.signatory || "", studioTitle: c?.studio?.title || "",
  clientCompany: c?.client?.company || "", clientSignatory: c?.client?.signatory || "", clientTitle: c?.client?.title || "", clientEmail: c?.client?.email || "",
  clauses: (c?.clauses || []).map((x) => ({ ...x })),
});

function ContractEditor({ open, contract, projects = [], onClose, onSave }) {
  const [f, setF] = useState(() => seedForm(contract));
  useEffect(() => { if (open) setF(seedForm(contract)); }, [open, contract?.id]); // eslint-disable-line
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const setClause = (id, key, val) => setF((p) => ({ ...p, clauses: p.clauses.map((c) => (c.id === id ? { ...c, [key]: val } : c)) }));
  const addClause = () => setF((p) => ({ ...p, clauses: [...p.clauses, { id: `new-${Date.now()}`, heading: "", body: "" }] }));
  const removeClause = (id) => setF((p) => ({ ...p, clauses: p.clauses.filter((c) => c.id !== id) }));

  const save = () => {
    if (!contract) return;
    onSave({
      title: f.title.trim() || "Agreement", projectId: f.projectId || null, effectiveDate: f.effectiveDate, termMonths: Number(f.termMonths) || 0,
      fee: f.fee.trim(), paymentTerms: f.paymentTerms.trim(), cadence: f.cadence.trim(), scope: f.scope.trim(),
      deliverables: f.deliverables.split("\n").map((s) => s.trim()).filter(Boolean),
      studio: { ...contract.studio, signatory: f.studioSignatory.trim(), title: f.studioTitle.trim() },
      client: { ...contract.client, company: f.clientCompany.trim(), signatory: f.clientSignatory.trim(), title: f.clientTitle.trim(), email: f.clientEmail.trim() },
      clauses: f.clauses.filter((c) => c.heading.trim() || c.body.trim()),
    }, contract.id);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit contract" width={680}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Title" className="sm:col-span-2"><Input value={f.title} onChange={set("title")} placeholder="Creative Services Agreement" /></Field>
        <Field label="Covers project" hint="Its phases, pillars & audience fold into this contract" className="sm:col-span-2">
          <Select value={f.projectId} onChange={set("projectId")}>
            <option value="">— none —</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Effective date"><Input type="date" value={f.effectiveDate} onChange={set("effectiveDate")} /></Field>
        <Field label="Term (months)"><Input type="number" min="0" value={f.termMonths} onChange={set("termMonths")} /></Field>
        <Field label="Fee"><Input value={f.fee} onChange={set("fee")} placeholder="Rp 25,000,000 / month" /></Field>
        <Field label="Payment terms"><Input value={f.paymentTerms} onChange={set("paymentTerms")} placeholder="Net 14 days" /></Field>
        <Field label="Cadence" className="sm:col-span-2"><Input value={f.cadence} onChange={set("cadence")} placeholder="5×/week across Instagram, TikTok…" /></Field>
        <Field label="Scope" className="sm:col-span-2"><Textarea rows={3} value={f.scope} onChange={set("scope")} /></Field>
        <Field label="Deliverables" hint="One per line" className="sm:col-span-2"><Textarea rows={4} value={f.deliverables} onChange={set("deliverables")} placeholder={"Monthly content calendar\nContent production\nMonthly report"} /></Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t hairline">
        <Field label="Bodega signatory"><Input value={f.studioSignatory} onChange={set("studioSignatory")} placeholder="e.g. Reno" /></Field>
        <Field label="Bodega title"><Input value={f.studioTitle} onChange={set("studioTitle")} placeholder="CEO" /></Field>
        <Field label="Client company"><Input value={f.clientCompany} onChange={set("clientCompany")} /></Field>
        <Field label="Client email"><Input value={f.clientEmail} onChange={set("clientEmail")} /></Field>
        <Field label="Client signatory"><Input value={f.clientSignatory} onChange={set("clientSignatory")} placeholder="Their name" /></Field>
        <Field label="Client title"><Input value={f.clientTitle} onChange={set("clientTitle")} placeholder="Their title" /></Field>
      </div>

      <div className="mt-4 pt-4 border-t hairline">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Terms &amp; conditions</p>
          <button onClick={addClause} className="text-xs text-muted hover:text-accent inline-flex items-center gap-1 font-medium"><Plus size={14} /> Add clause</button>
        </div>
        <div className="flex flex-col gap-3">
          {f.clauses.map((cl) => (
            <div key={cl.id} className="glass-2 hairline border rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input value={cl.heading} onChange={(e) => setClause(cl.id, "heading", e.target.value)} placeholder="Clause heading" className="!py-1.5" />
                <button onClick={() => removeClause(cl.id)} className="p-1.5 rounded-lg text-muted hover:text-[#d6336c] shrink-0" title="Remove clause"><Trash2 size={15} /></button>
              </div>
              <Textarea rows={2} value={cl.body} onChange={(e) => setClause(cl.id, "body", e.target.value)} placeholder="Clause text" />
            </div>
          ))}
          {f.clauses.length === 0 && <p className="text-sm text-muted">No clauses — add one above.</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save}>Save contract</Button>
      </div>
    </Modal>
  );
}
