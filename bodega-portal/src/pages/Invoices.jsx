import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Plus, Pencil, Printer, Trash2, ArrowLeft, Send, CheckCircle2, Building2, X } from "lucide-react";
import { useData, useSelectedClient, useCurrentUser } from "../store.jsx";
import { Card, Button, Badge, PageTitle, EmptyState, Modal, fadeUp, cx } from "../lib/ui.jsx";
import { Field, Input, Textarea, Select } from "../lib/forms.jsx";
import { WORDMARK } from "../lib/brand.js";
import { inv, money, fmtDateL, invoiceTotals } from "../lib/invoiceI18n.js";
import { LANGS } from "../lib/contractI18n.js";

const STATUS_C = { Draft: "#8a8f98", Sent: "#c97a0a", Paid: "#0f9d58", Overdue: "#d6336c" };
const CURRENCIES = ["IDR", "USD", "SGD", "EUR"];

const displayStatus = (v) => (v.status === "Sent" && v.dueDate && v.dueDate < new Date().toISOString().slice(0, 10) ? "Overdue" : v.status);

function LangToggle({ lang, onChange }) {
  return (
    <div className="flex gap-0.5 p-0.5 rounded-lg glass-2 hairline border" title="Invoice language">
      {LANGS.map((l) => (
        <button key={l.code} onClick={() => onChange(l.code)} title={l.name}
          className={cx("px-2.5 py-1 rounded-md text-xs font-semibold transition-colors", lang === l.code ? "" : "text-muted")}
          style={lang === l.code ? { background: "var(--text)", color: "var(--bg)" } : undefined}>{l.label}</button>
      ))}
    </div>
  );
}

export default function Invoices() {
  const client = useSelectedClient();
  const me = useCurrentUser();
  const canEdit = me.role !== "client";
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useData();
  const [openId, setOpenId] = useState(null);
  const [editing, setEditing] = useState(null); // invoice being edited | null

  const list = useMemo(
    () => invoices.filter((v) => v.clientId === client?.id && (canEdit || v.status !== "Draft")),
    [invoices, client, canEdit]
  );
  const current = invoices.find((v) => v.id === openId) || null;

  if (!client) return <EmptyState icon={Building2} title="No client selected" sub="Pick a client to view invoices." />;

  // ── single invoice document view ──
  if (current) {
    const t = inv(current.lang || "en");
    const st = displayStatus(current);
    return (
      <motion.div {...fadeUp}>
        <div className="no-print flex flex-wrap items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}><ArrowLeft size={14} /> {t.back}</Button>
          <LangToggle lang={current.lang || "en"} onChange={(l) => updateInvoice(current.id, { lang: l })} />
          <Badge color={STATUS_C[st]}>{t.status[st] || st}</Badge>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {canEdit && current.status === "Draft" && <Button size="sm" onClick={() => updateInvoice(current.id, { status: "Sent" })}><Send size={14} /> {t.send}</Button>}
            {canEdit && current.status !== "Paid" && <Button variant="ghost" size="sm" onClick={() => updateInvoice(current.id, { status: "Paid" })}><CheckCircle2 size={14} /> {t.markPaid}</Button>}
            {canEdit && current.status === "Paid" && <Button variant="ghost" size="sm" onClick={() => updateInvoice(current.id, { status: "Sent" })}><X size={14} /> {t.markUnpaid}</Button>}
            {canEdit && <Button variant="ghost" size="sm" onClick={() => setEditing(current)}><Pencil size={14} /> {t.edit}</Button>}
            <Button variant="ghost" size="sm" onClick={() => window.print()}><Printer size={14} /> {t.print}</Button>
          </div>
        </div>

        <InvoiceDoc invoice={current} t={t} client={client} />

        {canEdit && (
          <div className="text-center mt-4 no-print">
            <button onClick={() => { if (confirm(t.deleteConfirm)) { deleteInvoice(current.id); setOpenId(null); } }} className="text-xs text-muted hover:text-[#d6336c] inline-flex items-center gap-1.5"><Trash2 size={13} /> {t.deleteInvoice}</button>
          </div>
        )}

        <InvoiceEditor invoice={editing} onClose={() => setEditing(null)} onSave={(patch, id) => { updateInvoice(id, patch); setEditing(null); }} />
      </motion.div>
    );
  }

  // ── list view ──
  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker={client.name} title="Invoices">
        {canEdit && <Button onClick={() => { const v = addInvoice(client.id); setOpenId(v.id); setEditing(v); }}><Plus size={16} /> New invoice</Button>}
      </PageTitle>

      {list.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices yet" sub={canEdit ? `Create the first invoice for ${client.name}.` : "Your studio will share invoices here."} />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((v) => {
            const { total } = invoiceTotals(v);
            const st = displayStatus(v);
            return (
              <button key={v.id} onClick={() => setOpenId(v.id)} className="glass hover:border-[color:var(--line-2)] transition-colors p-4 flex flex-wrap items-center gap-3 text-left">
                <Receipt size={18} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{v.number}</p>
                  <p className="text-xs text-muted">{fmtDateL(v.issueDate, v.lang)} · {(v.items || []).length} item{(v.items || []).length === 1 ? "" : "s"}</p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <span className="font-semibold tabular-nums text-sm">{money(total, v.currency)}</span>
                  <Badge color={STATUS_C[st]}>{inv(v.lang).status[st] || st}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function InvoiceDoc({ invoice, t, client }) {
  const { subtotal, tax, total } = invoiceTotals(invoice);
  const cur = invoice.currency || "IDR";
  const cols = { gridTemplateColumns: "1fr 44px 120px 130px" };
  const paid = invoice.status === "Paid";
  return (
    <Card className="print-area max-w-[860px] mx-auto !p-0">
      <table className="doc-table">
        <thead className="print-head">
          <tr><td>
            <div className="print-letterhead" aria-hidden="true">
              <img src={WORDMARK} alt="Bodega" className="ll-logo" />
              <span className="ll-meta">{invoice.studio.name}<br />{invoice.studio.email} · {invoice.studio.address}</span>
            </div>
          </td></tr>
        </thead>
        <tbody><tr><td>
          <div className="p-5 sm:p-7 md:p-10 doc-body flex flex-col gap-7 relative">
            {paid && (
              <span className="absolute top-6 right-6 text-2xl font-extrabold tracking-widest px-4 py-1.5 rounded" style={{ color: "#0f9d58", border: "3px solid #0f9d58", transform: "rotate(-10deg)", opacity: 0.85 }}>{t.paidStamp}</span>
            )}

            <header className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b hairline avoid-break">
              <div>
                <span className="brand-logo no-print inline-block mb-3" style={{ height: 22, width: 84 }} />
                <h2 className="display text-3xl md:text-4xl font-bold tracking-tight">{t.invoice}</h2>
                <p className="text-sm text-muted mt-1">{t.number}: <strong>{invoice.number}</strong></p>
              </div>
              <div className="text-sm sm:text-right">
                <p><span className="text-faint">{t.date}: </span>{fmtDateL(invoice.issueDate, invoice.lang)}</p>
                <p><span className="text-faint">{t.dueDate}: </span>{fmtDateL(invoice.dueDate, invoice.lang)}</p>
              </div>
            </header>

            {/* bill to */}
            <div className="grid sm:grid-cols-2 gap-5 avoid-break">
              <div>
                <p className="eyebrow mb-2">{t.billTo}</p>
                <p className="font-semibold">{invoice.billTo.company || client.name}</p>
                {invoice.billTo.attn && <p className="text-sm">{t.attn}: {invoice.billTo.attn}</p>}
                {invoice.billTo.email && <p className="text-xs text-muted mt-1">{invoice.billTo.email}</p>}
                {invoice.billTo.address && <p className="text-xs text-muted mt-1 leading-relaxed">{invoice.billTo.address}</p>}
              </div>
              <div className="sm:text-right">
                <p className="eyebrow mb-2">{t.from}</p>
                <p className="font-semibold">{invoice.studio.name}</p>
                <p className="text-xs text-muted mt-1">{invoice.studio.email}</p>
                <p className="text-xs text-muted leading-relaxed">{invoice.studio.address}</p>
              </div>
            </div>

            {/* line items */}
            <div className="text-sm">
              <div className="grid gap-2 pb-2 border-b-2 hairline eyebrow !text-[10px]" style={cols}>
                <span>{t.description}</span><span className="text-right">{t.qty}</span><span className="text-right">{t.unitPrice}</span><span className="text-right">{t.amount}</span>
              </div>
              {(invoice.items || []).map((it) => (
                <div key={it.id} className="grid gap-2 py-2.5 border-b hairline avoid-break" style={cols}>
                  <span>{it.description || "—"}</span>
                  <span className="text-right tabular-nums">{it.qty}</span>
                  <span className="text-right tabular-nums">{money(it.unitPrice, cur)}</span>
                  <span className="text-right tabular-nums font-medium">{money((Number(it.qty) || 0) * (Number(it.unitPrice) || 0), cur)}</span>
                </div>
              ))}
              {/* totals */}
              <div className="flex justify-end mt-4 avoid-break">
                <div className="w-full sm:w-72 flex flex-col gap-1.5">
                  <Row label={t.subtotal} value={money(subtotal, cur)} />
                  {invoice.taxRate > 0 && <Row label={`${t.tax} (${invoice.taxRate}%)`} value={money(tax, cur)} />}
                  <div className="flex justify-between border-t-2 hairline pt-2 mt-1">
                    <span className="font-semibold">{t.total}</span>
                    <span className="font-bold tabular-nums">{money(total, cur)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* payment + notes */}
            <div className="grid sm:grid-cols-2 gap-5 pt-5 border-t hairline avoid-break">
              <div>
                <p className="eyebrow mb-2">{t.paymentTo}</p>
                <p className="text-sm">{invoice.bank?.bank} · {invoice.bank?.accountNo}</p>
                <p className="text-sm text-muted">{t.accountName}: {invoice.bank?.accountName}</p>
                <p className="text-xs text-muted mt-2"><span className="text-faint">{t.paymentTerms}: </span>{invoice.paymentTerms}</p>
              </div>
              <div className="sm:text-right">
                {invoice.notes && <><p className="eyebrow mb-2">{t.notes}</p><p className="text-sm text-muted">{invoice.notes}</p></>}
                <p className="text-sm mt-3">{t.thanks}</p>
              </div>
            </div>
          </div>
        </td></tr></tbody>
      </table>
    </Card>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between text-sm"><span className="text-muted">{label}</span><span className="tabular-nums">{value}</span></div>;
}

/* ── editor ──────────────────────────────────────────────────────────── */
const seedForm = (v) => ({
  number: v?.number || "", issueDate: v?.issueDate || "", dueDate: v?.dueDate || "", status: v?.status || "Draft", currency: v?.currency || "IDR",
  taxRate: v?.taxRate ?? 11, paymentTerms: v?.paymentTerms || "", notes: v?.notes || "",
  company: v?.billTo?.company || "", attn: v?.billTo?.attn || "", email: v?.billTo?.email || "", address: v?.billTo?.address || "",
  bank: v?.bank?.bank || "", accountName: v?.bank?.accountName || "", accountNo: v?.bank?.accountNo || "",
  items: (v?.items || []).map((it) => ({ ...it })),
});

function InvoiceEditor({ invoice, onClose, onSave }) {
  const [f, setF] = useState(() => seedForm(invoice));
  useEffect(() => { if (invoice) setF(seedForm(invoice)); }, [invoice?.id]); // eslint-disable-line
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const setItem = (id, key, val) => setF((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, [key]: val } : it)) }));
  const addItem = () => setF((p) => ({ ...p, items: [...p.items, { id: `it-${Date.now()}`, description: "", qty: 1, unitPrice: 0 }] }));
  const removeItem = (id) => setF((p) => ({ ...p, items: p.items.filter((it) => it.id !== id) }));

  const liveTotal = invoiceTotals({ items: f.items, taxRate: f.taxRate });

  const save = () => {
    if (!invoice) return;
    onSave({
      number: f.number.trim(), issueDate: f.issueDate, dueDate: f.dueDate, status: f.status, currency: f.currency,
      taxRate: Number(f.taxRate) || 0, paymentTerms: f.paymentTerms.trim(), notes: f.notes.trim(),
      billTo: { ...invoice.billTo, company: f.company.trim(), attn: f.attn.trim(), email: f.email.trim(), address: f.address.trim() },
      bank: { ...invoice.bank, bank: f.bank.trim(), accountName: f.accountName.trim(), accountNo: f.accountNo.trim() },
      items: f.items.map((it) => ({ id: it.id, description: it.description, qty: Number(it.qty) || 0, unitPrice: Number(it.unitPrice) || 0 })).filter((it) => it.description.trim() || it.unitPrice),
    }, invoice.id);
  };

  return (
    <Modal open={!!invoice} onClose={onClose} title="Edit invoice" width={720}>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Number"><Input value={f.number} onChange={set("number")} placeholder="INV/001/BCS/VI/2026" /></Field>
        <Field label="Status"><Select value={f.status} onChange={set("status")}>{["Draft", "Sent", "Paid"].map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
        <Field label="Currency"><Select value={f.currency} onChange={set("currency")}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
        <Field label="Issue date"><Input type="date" value={f.issueDate} onChange={set("issueDate")} /></Field>
        <Field label="Due date"><Input type="date" value={f.dueDate} onChange={set("dueDate")} /></Field>
        <Field label="Tax / PPN (%)"><Input type="number" min="0" value={f.taxRate} onChange={set("taxRate")} /></Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t hairline">
        <Field label="Bill to — company"><Input value={f.company} onChange={set("company")} /></Field>
        <Field label="Attn"><Input value={f.attn} onChange={set("attn")} placeholder="Contact person" /></Field>
        <Field label="Client email"><Input value={f.email} onChange={set("email")} /></Field>
        <Field label="Client address"><Input value={f.address} onChange={set("address")} /></Field>
      </div>

      {/* line items */}
      <div className="mt-4 pt-4 border-t hairline">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Line items</p>
          <button onClick={addItem} className="text-xs text-muted hover:text-accent inline-flex items-center gap-1 font-medium"><Plus size={14} /> Add item</button>
        </div>
        <div className="flex flex-col gap-2">
          {f.items.map((it) => (
            <div key={it.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 64px 130px 28px" }}>
              <Input value={it.description} onChange={(e) => setItem(it.id, "description", e.target.value)} placeholder="Description" className="!py-1.5" />
              <Input type="number" min="0" value={it.qty} onChange={(e) => setItem(it.id, "qty", e.target.value)} className="!py-1.5 text-right" />
              <Input type="number" min="0" value={it.unitPrice} onChange={(e) => setItem(it.id, "unitPrice", e.target.value)} placeholder="Unit price" className="!py-1.5 text-right" />
              <button onClick={() => removeItem(it.id)} className="p-1.5 rounded-lg text-muted hover:text-[#d6336c]" title="Remove"><Trash2 size={15} /></button>
            </div>
          ))}
          {f.items.length === 0 && <p className="text-sm text-muted">No items — add one.</p>}
        </div>
        <p className="text-sm text-right mt-3 font-semibold">Total: <span className="tabular-nums">{money(liveTotal.total, f.currency)}</span></p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t hairline">
        <Field label="Bank"><Input value={f.bank} onChange={set("bank")} placeholder="BCA" /></Field>
        <Field label="Account name"><Input value={f.accountName} onChange={set("accountName")} /></Field>
        <Field label="Account no."><Input value={f.accountNo} onChange={set("accountNo")} placeholder="123-456-7890" /></Field>
        <Field label="Payment terms" className="sm:col-span-2"><Input value={f.paymentTerms} onChange={set("paymentTerms")} placeholder="Net 14 days" /></Field>
        <Field label="Notes" className="sm:col-span-3"><Textarea rows={2} value={f.notes} onChange={set("notes")} /></Field>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save}>Save invoice</Button>
      </div>
    </Modal>
  );
}
