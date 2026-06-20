import { Router, Route, Switch, Redirect, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeProvider, AuthProvider, DataProvider, useAuth } from "./store.jsx";
import AuroraBg from "./components/AuroraBg.jsx";
import AppShell from "./components/AppShell.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ContentBoard from "./pages/ContentBoard.jsx";
import Approvals from "./pages/Approvals.jsx";
import Calendar from "./pages/Calendar.jsx";
import Reports from "./pages/Reports.jsx";

const Portal = (Page) => () => (
  <AppShell>
    <Page />
  </AppShell>
);

function Routes() {
  const { authed } = useAuth();
  const [loc] = useLocation();
  if (!authed && loc !== "/login") return <Redirect to="/login" />;
  if (authed && (loc === "/login" || loc === "/")) return <Redirect to="/app" />;

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/app" component={Portal(Dashboard)} />
      <Route path="/app/projects" component={Portal(Projects)} />
      <Route path="/app/content" component={Portal(ContentBoard)} />
      <Route path="/app/approvals" component={Portal(Approvals)} />
      <Route path="/app/calendar" component={Portal(Calendar)} />
      <Route path="/app/reports" component={Portal(Reports)} />
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
