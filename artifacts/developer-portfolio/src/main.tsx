import { createRoot } from "react-dom/client";
import { Route, Router, Switch } from "wouter";
import App from "./App";
import ChatbotRecruteurDemo from "./pages/ChatbotRecruteurDemo";
import "./index.css";

const baseRaw = import.meta.env.BASE_URL || "/";
const basePath = baseRaw.endsWith("/") ? baseRaw.slice(0, -1) : baseRaw;

createRoot(document.getElementById("root")!).render(
  <Router base={basePath}>
    <Switch>
      <Route path="/demos/chatbot-recruteur" component={ChatbotRecruteurDemo} />
      <Route component={App} />
    </Switch>
  </Router>,
);
