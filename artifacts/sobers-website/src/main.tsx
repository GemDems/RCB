import { createRoot } from "react-dom/client";
import { Router, Switch, Route } from "wouter";
import App from "./App";
import GetDemoPage from "./pages/GetDemoPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Router>
    <Switch>
      <Route path="/demo" component={GetDemoPage} />
      <Route component={App} />
    </Switch>
  </Router>
);
