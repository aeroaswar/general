import { PageTitle, Card, Badge, Avatar } from "../ui.jsx";
import { PROJECT_STATUS_C, fmtDate } from "../status.js";
import { useData, useVisibleClients } from "../store.jsx";

export default function Clients() {
  const clients = useVisibleClients();
  const { store, setSelectedClientId } = useData();

  return (
    <>
      <PageTitle kicker="Set up" title="Clients" />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map((c) => {
          const projects = store.projects.filter((p) => p.clientId === c.id);
          const openInv = store.invoices.filter((i) => i.clientId === c.id && i.status !== "Paid").length;
          return (
            <Card key={c.id} hover className="flex flex-col gap-3 cursor-pointer" onClick={() => setSelectedClientId(c.id)}>
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size={38} />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted">{c.industry}</p>
                </div>
                <span className="ml-auto chip" style={{ color: PROJECT_STATUS_C[c.status] || "var(--muted)" }}>{c.status}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm glass-2 hairline border rounded-lg px-3 py-2">
                    <span className="truncate">{p.name}</span>
                    <Badge color={PROJECT_STATUS_C[p.status]}>{p.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted mono border-t hairline pt-3 mt-auto">
                <span>since {fmtDate(c.since, "MMM yyyy")}</span>
                <span>{openInv} open invoice{openInv === 1 ? "" : "s"}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
