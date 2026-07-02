import { PageTitle, Card, Button, Avatar } from "../ui.jsx";
import { ROLE_META, fromNow } from "../status.js";
import { useAuth, useTheme, useData } from "../store.jsx";

export default function Settings() {
  const { me, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { store, setStore } = useData();

  const reset = () => {
    localStorage.removeItem("bodega-store-v2");
    location.reload();
  };

  return (
    <>
      <PageTitle kicker="System" title="Settings" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="flex flex-col gap-4">
          <p className="eyebrow">Account</p>
          <div className="flex items-center gap-3">
            <Avatar name={me.name} size={44} />
            <div>
              <p className="font-semibold">{me.name}</p>
              <p className="text-sm text-muted">{me.email}</p>
              <p className="text-xs mt-0.5" style={{ color: ROLE_META[me.role].c }}>{ROLE_META[me.role].label}</p>
            </div>
          </div>
          <div className="flex gap-2 border-t hairline pt-4">
            <Button variant="ghost" size="sm" onClick={toggle}>Theme: {theme}</Button>
            <Button variant="ghost" size="sm" onClick={logout}>Switch role</Button>
            <Button variant="danger" size="sm" onClick={reset}>Reset demo data</Button>
          </div>
        </Card>
        <Card>
          <p className="eyebrow mb-3">Audit log</p>
          {store.audit.length === 0 ? (
            <p className="text-sm text-muted">No activity yet — actions you take are logged here.</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-72 overflow-auto no-scrollbar">
              {store.audit.map((a) => (
                <li key={a.id} className="text-sm flex items-center gap-2">
                  <span className="chip">{a.action}</span>
                  <span className="mono text-xs text-faint ml-auto">{fromNow(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
