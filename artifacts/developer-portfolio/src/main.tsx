import { createRoot } from "react-dom/client";
import { Route, Router, Switch } from "wouter";
import App from "./App";
import AnnuaireDemo from "./pages/AnnuaireDemo";
import ChatbotRecruteurDemo from "./pages/ChatbotRecruteurDemo";
import NeonWeatherDemo from "./pages/NeonWeatherDemo";
import TsaApp from "./pages/tsa/TsaApp";
import "./index.css";

const baseRaw = import.meta.env.BASE_URL || "/";
const basePath = baseRaw.endsWith("/") ? baseRaw.slice(0, -1) : baseRaw;

createRoot(document.getElementById("root")!).render(
  <Router base={basePath}>
    <Switch>
      <Route path="/demos/chatbot-recruteur" component={ChatbotRecruteurDemo} />
      <Route path="/demos/neon-weather" component={NeonWeatherDemo} />
      <Route path="/demos/annuaire" component={AnnuaireDemo} />
      <Route path="/demos/ecole-tsa" component={TsaApp} />
      <Route component={App} />
    </Switch>
  </Router>,
);
