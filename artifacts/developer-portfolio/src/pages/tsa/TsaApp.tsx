import React, { useState } from "react";
import { TsaProvider } from "./TsaContext";
import "./tsa.css";
import TabTableauBord from "./tabs/TabTableauBord";
import TabHumeur from "./tabs/TabHumeur";
import TabPlanning from "./tabs/TabPlanning";
import TabEleves from "./tabs/TabEleves";
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
  { id: "eleves", label: "🧒 Fiches Élèves", component: TabEleves },
  { id: "enseignante", label: "👩‍🏫 Enseignante", component: TabEnseignante },
  { id: "aesh", label: "🤝 Personnel d'accompagnement", component: TabAESH },
  { id: "calendrier", label: "🗓️ Calendrier", component: TabCalendrier },
  { id: "projet-annuel", label: "🎯 Projet Annuel", component: TabProjetAnnuel },
  { id: "remplacement", label: "🔄 Remplacement", component: TabRemplacement },
  { id: "carnet", label: "📝 Carnet de Liaison", component: TabCarnet },
  { id: "ressources", label: "📚 Ressources", component: TabRessources },
  { id: "parametres", label: "⚙️ Paramètres", component: TabParametres },
];

function TsaInner() {
  const [activeTab, setActiveTab] = useState("tableau-bord");
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component ?? TabTableauBord;

  return (
    <div className="tsa-root">
      {/* Inject Nunito font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');.tsa-root{font-family:'Nunito',sans-serif}`}</style>

      <header className="tsa-header">
        <div className="tsa-logo">
          🌱 École TSA
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--tsa-muted)", marginLeft: 4 }}>Espace pédagogique</span>
        </div>
        <div className="tsa-header-actions">
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
    <TsaProvider>
      <TsaInner />
    </TsaProvider>
  );
}
