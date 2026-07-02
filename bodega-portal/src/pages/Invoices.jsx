import { PageTitle, Card, cx } from "../ui.jsx";
import { fmtDate } from "../status.js";
import { useData, useSelectedClient } from "../store.jsx";

const STATUS_C = { Paid: "#0f9d58", Sent: "#2562e7", Overdue: "#d6336c", Draft: "#8a8f98" };
const idr = (n) => "Rp " + n.toLocaleString("id-ID");

export default function Invoices() {
  const { store } = useData();
  const client = useSelectedClient();
  const rows = store.invoices.filter((i) => i.clientId === client?.id);
  const outstanding = rows.filter((i) => i.status === "Sent" || i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <PageTitle kicker={client?.name} title="Invoices">
        <span className="chip" style={{ color: outstanding ? "#c97a0a" : "#0f9d58" }}>
          outstanding {idr(outstanding)}
        </span>
      </PageTitle>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b hairline">
              {["Invoice", "Issued", "Due", "Amount", "Status", "Memo"].map((h) => (
                <th key={h} className="eyebrow font-normal px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((i, idx) => (
              <tr key={i.id} className={cx(idx % 2 === 1 && "glass-2", "border-b hairline last:border-0")}>
                <td className="px-4 py-3 mono text-xs">{i.number}</td>
                <td className="px-4 py-3 mono text-xs text-muted">{fmtDate(i.issued)}</td>
                <td className="px-4 py-3 mono text-xs text-muted">{fmtDate(i.due)}</td>
                <td className="px-4 py-3 font-semibold">{idr(i.amount)}</td>
                <td className="px-4 py-3">
                  <span className="chip" style={{ color: STATUS_C[i.status] }}>
                    <i className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: STATUS_C[i.status] }} />
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{i.memo}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No invoices for this client.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
