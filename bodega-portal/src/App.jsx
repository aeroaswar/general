import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import AppShell from "./AppShell.jsx";
import Login from "./pages/Login.jsx";
import Cockpit from "./pages/Cockpit.jsx";
import Queue from "./pages/Queue.jsx";
import Clients from "./pages/Clients.jsx";
import Project from "./pages/Project.jsx";
import Content from "./pages/Content.jsx";
import Calendar from "./pages/Calendar.jsx";
import Approvals from "./pages/Approvals.jsx";
import Reports from "./pages/Reports.jsx";
import Invoices from "./pages/Invoices.jsx";
import Settings from "./pages/Settings.jsx";
import { useAuth } from "./store.jsx";

export default function App() {
  const { me } = useAuth();
  if (!me) return <Login />;

  return (
    <Router hook={useHashLocation}>
      <AppShell>
        <Switch>
          <Route path="/" component={Cockpit} />
          {me.role !== "client" && <Route path="/queue" component={Queue} />}
          {me.role === "admin" && <Route path="/clients" component={Clients} />}
          <Route path="/project" component={Project} />
          <Route path="/content" component={Content} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/approvals" component={Approvals} />
          <Route path="/reports" component={Reports} />
          {me.role !== "team" && <Route path="/invoices" component={Invoices} />}
          <Route path="/settings" component={Settings} />
          <Route>{() => <Cockpit />}</Route>
        </Switch>
      </AppShell>
    </Router>
  );
}
