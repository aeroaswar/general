import { Router, Route, Switch, Redirect, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeProvider, AuthProvider, DataProvider, useAuth, useCurrentUser } from "./store.jsx";
import AuroraBg from "./components/AuroraBg.jsx";
import AppShell from "./components/AppShell.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Clients from "./pages/Clients.jsx";
import Projects from "./pages/Projects.jsx";
import ContentBoard from "./pages/ContentBoard.jsx";
import Approvals from "./pages/Approvals.jsx";
import Calendar from "./pages/Calendar.jsx";
import Reports from "./pages/Reports.jsx";
import MyQueue from "./pages/MyQueue.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import Assets from "./pages/Assets.jsx";
import Assessment from "./pages/Assessment.jsx";
import Settings from "./pages/Settings.jsx";

const Portal = (Page) => () => (
  <AppShell>
    <Page />
  </AppShell>
);

const CLIENT_BLOCKED = ["/app/clients", "/app/projects", "/app/queue", "/app/content", "/app/campaigns", "/app/assessment"];

function Routes() {
  const { authed } = useAuth();
  const me = useCurrentUser();
  const [loc] = useLocation();
  if (!authed && loc !== "/login") return <Redirect to="/login" />;
  if (authed && (loc === "/login" || loc === "/")) return <Redirect to="/app" />;
  if (authed && me.role === "client" && CLIENT_BLOCKED.some((p) => loc.startsWith(p))) return <Redirect to="/app" />;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/app" component={Portal(Dashboard)} />
      <Route path="/app/clients" component={Portal(Clients)} />
      <Route path="/app/projects" component={Portal(Projects)} />
      <Route path="/app/queue" component={Portal(MyQueue)} />
      <Route path="/app/content" component={Portal(ContentBoard)} />
      <Route path="/app/approvals" component={Portal(Approvals)} />
      <Route path="/app/calendar" component={Portal(Calendar)} />
      <Route path="/app/campaigns" component={Portal(Campaigns)} />
      <Route path="/app/assets" component={Portal(Assets)} />
      <Route path="/app/reports" component={Portal(Reports)} />
      <Route path="/app/assessment" component={Portal(Assessment)} />
      <Route path="/app/settings" component={Portal(Settings)} />
      <Route><Redirect to="/app" /></Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AuroraBg />
          <Router hook={useHashLocation}>
            <Routes />
          </Router>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
