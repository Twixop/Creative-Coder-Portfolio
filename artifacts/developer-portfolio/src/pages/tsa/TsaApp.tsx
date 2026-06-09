import React, { useState, useCallback, useEffect, useRef } from "react";
import { TsaProvider, useTsa } from "./TsaContext";
import { setupPwa } from "./pwa";
import "./tsa.css";
import TabTableauBord from "./tabs/TabTableauBord";
import TabHumeur from "./tabs/TabHumeur";
import TabPlanning from "./tabs/TabPlanning";
import TabEleves from "./tabs/TabEleves";
import TabComportements from "./tabs/TabComportements";
import TabRoutine from "./tabs/TabRoutine";
import { TabEnseignante, TabAESH } from "./tabs/TabPersonnel";
import TabCalendrier from "./tabs/TabCalendrier";
import TabProjetAnnuel from "./tabs/TabProjetAnnuel";
import TabRemplacement from "./tabs/TabRemplacement";
import TabCarnet from "./tabs/TabCarnet";
import TabRessources from "./tabs/TabRessources";
import TabParametres from "./tabs/TabParametres";

const TABS = [
  { id: "tableau-bord", label: "📊 Tableau de Bord", component: TabTableauBord },
  { id: "humeur", label: "😊 Humeur du Jour", component: TabHumeur },
  { id: "planning", label: "📅 Planning Journalier", component: TabPlanning },
  { id: "routine", label: "▶️ Routine & Minuteur", component: TabRoutine },
  { id: "eleves", label: "🧒 Fiches Élèves", component: TabEleves },
  { id: "comportements", label: "📋 Comportements", component: TabComportements },
  { id: "enseignante", label: "👩‍🏫 Enseignante", component: TabEnseignante },
  { id: "aesh", label: "🤝 Personnel d'accompagnement", component: TabAESH },
  { id: "calendrier", label: "🗓️ Calendrier", component: TabCalendrier },
  { id: "projet-annuel", label: "🎯 Projet Annuel", component: TabProjetAnnuel },
  { id: "remplacement", label: "🔄 Remplacement", component: TabRemplacement },
  { id: "carnet", label: "📝 Carnet de Liaison", component: TabCarnet },
  { id: "ressources", label: "📚 Ressources", component: TabRessources },
  { id: "parametres", label: "⚙️ Paramètres", component: TabParametres },
];

const TSA_PASSWORD = "Popol090687";
const API_BASE = import.meta.env.BASE_URL + "api";

type SyncStatus = "idle" | "saving" | "loading" | "ok" | "error";

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (input === TSA_PASSWORD) {
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="tsa-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');.tsa-root{font-family:'Nunito',sans-serif}`}</style>
      <div className="tsa-card" style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: 36 }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🌱</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--tsa-sage)", margin: "0 0 6px" }}>École TSA</h1>
        <p style={{ color: "var(--tsa-muted)", fontSize: "0.9rem", marginBottom: 28 }}>Espace pédagogique — accès restreint</p>
        <form onSubmit={tryUnlock}>
          <input
            className="tsa-input"
            type="password"
            placeholder="Mot de passe"
            value={input}
            autoFocus
            onChange={e => setInput(e.target.value)}
            style={{
              width: "100%", marginBottom: 12, textAlign: "center",
              border: error ? "2px solid #e53e3e" : undefined,
              background: error ? "#fff5f5" : undefined,
            }}
          />
          {error && <p style={{ color: "#e53e3e", fontSize: "0.82rem", margin: "0 0 10px", fontWeight: 700 }}>Mot de passe incorrect</p>}
          <button type="submit" className="tsa-btn tsa-btn-primary" style={{ width: "100%" }}>
            Accéder →
          </button>
        </form>
      </div>
    </div>
  );
}

function SyncBar() {
  const { state, dispatch } = useTsa();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [recordId, setRecordId] = useState<string | undefined>(undefined);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const serialized = JSON.stringify(state);
  const lastSavedRef = useRef<string | null>(null);
  const [armed, setArmed] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Arming: on attend que le chargement initial (localStorage) soit passé
  // avant de considérer les changements comme "non sauvegardés".
  useEffect(() => {
    const t = setTimeout(() => {
      lastSavedRef.current = JSON.stringify(stateRef.current);
      setArmed(true);
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  const dirty = armed && lastSavedRef.current !== null && lastSavedRef.current !== serialized;

  const save = useCallback(async () => {
    setStatus("saving");
    const snapshot = JSON.stringify(stateRef.current);
    try {
      const res = await fetch(`${API_BASE}/tsa/state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: stateRef.current, recordId }),
      });
      const data = await res.json() as { ok?: boolean; recordId?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Erreur");
      setRecordId(data.recordId);
      lastSavedRef.current = snapshot;
      setLastSync(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [recordId]);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/tsa/state`);
      const data = await res.json() as { state?: unknown; recordId?: string; error?: string };
      if (!res.ok || !data.state) throw new Error(data.error ?? "Aucune donnée");
      dispatch({ type: "LOAD", state: data.state as Parameters<typeof dispatch>[0] extends { state: infer S } ? S : never });
      if (data.recordId) setRecordId(data.recordId);
      lastSavedRef.current = JSON.stringify(data.state);
      setLastSync(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [dispatch]);

  // Auto-save (debounce) quand activé dans les paramètres.
  useEffect(() => {
    if (!state.settings.autoSave || !dirty || status !== "idle") return;
    const t = setTimeout(() => { void save(); }, 3500);
    return () => clearTimeout(t);
  }, [serialized, dirty, state.settings.autoSave, status, save]);

  const label = status === "saving" ? "⏳ Sauvegarde…" : status === "loading" ? "⏳ Chargement…" : status === "ok" ? "✓ Synchronisé" : status === "error" ? "✗ Erreur" : "☁️ Airtable";
  const color = status === "ok" ? "#22c55e" : status === "error" ? "#e53e3e" : "var(--tsa-sage)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {dirty && status === "idle" && (
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#c05621", fontWeight: 700 }}
          title="Des modifications ne sont pas encore enregistrées sur Airtable">
          <span className="tsa-unsaved-dot" /> non sauvegardé
        </span>
      )}
      {!dirty && lastSync && status === "idle" && (
        <span style={{ fontSize: "0.72rem", color: "var(--tsa-muted)" }}>
          {state.settings.autoSave ? "auto · " : ""}synchro {lastSync}
        </span>
      )}
      <span style={{ fontSize: "0.78rem", color, fontWeight: 700, minWidth: 90 }}>{label}</span>
      <button className="tsa-btn tsa-btn-sm tsa-btn-secondary" disabled={status !== "idle"} onClick={save} title="Sauvegarder vers Airtable">
        💾 Sauvegarder
      </button>
      <button className="tsa-btn tsa-btn-sm tsa-btn-ghost" disabled={status !== "idle"} onClick={load} title="Charger depuis Airtable">
        📥 Charger
      </button>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred) return null;

  return (
    <button className="tsa-btn tsa-btn-sm tsa-btn-secondary"
      title="Installer l'application sur cet appareil"
      onClick={async () => {
        await deferred.prompt();
        await deferred.userChoice;
        setDeferred(null);
      }}>
      📲 Installer
    </button>
  );
}

function TsaInner() {
  const [activeTab, setActiveTab] = useState("tableau-bord");
  const { state } = useTsa();
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component ?? TabTableauBord;

  useEffect(() => { setupPwa(); }, []);

  const a11yClass = [
    state.settings.largeText ? "tsa-large-text" : "",
    state.settings.highContrast ? "tsa-high-contrast" : "",
    state.settings.reduceMotion ? "tsa-reduce-motion" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={`tsa-root ${a11yClass}`.trim()}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');.tsa-root{font-family:'Nunito',sans-serif}`}</style>

      <header className="tsa-header">
        <div className="tsa-logo">
          🌱 École TSA
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--tsa-muted)", marginLeft: 4 }}>Espace pédagogique</span>
        </div>
        <div className="tsa-header-actions">
          <SyncBar />
          <InstallButton />
          <button
            className={`tsa-btn tsa-btn-sm ${activeTab === "remplacement" ? "tsa-btn-secondary" : "tsa-btn-ghost"}`}
            onClick={() => setActiveTab("remplacement")}>
            🔄 Mode Remplacement
          </button>
          <button
            className={`tsa-btn tsa-btn-sm ${activeTab === "parametres" ? "tsa-btn-primary" : "tsa-btn-ghost"}`}
            onClick={() => setActiveTab("parametres")}>
            ⚙️
          </button>
        </div>
      </header>

      <nav className="tsa-tabs">
        {TABS.filter(t => t.id !== "parametres").map(tab => (
          <button
            key={tab.id}
            className={`tsa-tab${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="tsa-content">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default function TsaApp() {
  return (
    <PasswordGate>
      <TsaProvider>
        <TsaInner />
      </TsaProvider>
    </PasswordGate>
  );
}
