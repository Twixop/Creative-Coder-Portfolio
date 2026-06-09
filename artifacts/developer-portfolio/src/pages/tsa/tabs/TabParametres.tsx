import React, { useState, useRef } from "react";
import { useTsa, DEFAULT_ACTIVITES, Activite, AppSettings, TsaState } from "../TsaContext";

const EMOJIS = ["🎨","📖","🧘","🏃","🎵","🧩","🍽️","🌿","💬","🖐️","🔢","✏️","🏊","🎭","🎲","🌱","🔬","💻","🎤","🎸"];
const COLORS = ["#f97316","#3b82f6","#8b5cf6","#22c55e","#ec4899","#eab308","#a16207","#166534","#0ea5e9","#fb923c","#ef4444","#64748b","#06b6d4","#d946ef","#84cc16"];

const A11Y_OPTIONS: { key: keyof AppSettings; label: string; desc: string; emoji: string }[] = [
  { key: "largeText", label: "Gros texte", desc: "Agrandit le texte de l'application", emoji: "🔠" },
  { key: "highContrast", label: "Contraste élevé", desc: "Couleurs plus contrastées pour une meilleure lisibilité", emoji: "🌗" },
  { key: "reduceMotion", label: "Réduire les animations", desc: "Désactive les transitions et animations", emoji: "🐢" },
  { key: "autoSave", label: "Sauvegarde automatique", desc: "Enregistre vers Airtable après chaque modification", emoji: "💾" },
];

export default function TabParametres() {
  const { state, dispatch } = useTsa();
  const [eleveDraft, setEleveDraft] = useState<string[]>(state.eleves);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ nom: "", emoji: "🎨", couleur: "#f97316" });
  const [showForm, setShowForm] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function saveEleves() {
    dispatch({ type: "SET_ELEVES", eleves: eleveDraft });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecole-tsa-sauvegarde-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as TsaState;
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.eleves)) {
          throw new Error("format");
        }
        dispatch({ type: "LOAD", state: parsed });
        setEleveDraft(parsed.eleves);
        setImportMsg("✓ Données importées avec succès");
      } catch {
        setImportMsg("✗ Fichier invalide");
      }
      setTimeout(() => setImportMsg(null), 4000);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function addActivite() {
    if (!form.nom.trim()) return;
    dispatch({
      type: "ADD_ACTIVITE",
      activite: { id: Date.now().toString(), nom: form.nom, emoji: form.emoji, couleur: form.couleur }
    });
    setForm({ nom: "", emoji: "🎨", couleur: "#f97316" });
    setShowForm(false);
  }

  return (
    <div>
      <h2 className="tsa-section-title">⚙️ Paramètres</h2>

      {/* Accessibilité */}
      <div className="tsa-card" style={{ marginBottom: 24 }}>
        <div className="tsa-section-title" style={{ margin: "0 0 4px" }}>♿ Accessibilité & confort</div>
        <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", margin: "0 0 14px" }}>
          Adapte l'affichage et le comportement de l'application.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
          {A11Y_OPTIONS.map(opt => {
            const on = state.settings[opt.key];
            return (
              <button
                key={opt.key}
                onClick={() => dispatch({ type: "SET_SETTINGS", settings: { [opt.key]: !on } })}
                style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer",
                  padding: "12px 14px", borderRadius: 12,
                  background: on ? "var(--tsa-sage-light)" : "var(--tsa-warm)",
                  border: `2px solid ${on ? "var(--tsa-sage)" : "var(--tsa-border)"}`,
                }}>
                <span style={{ fontSize: "1.5rem" }}>{opt.emoji}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: "0.88rem", color: "var(--tsa-text)" }}>{opt.label}</span>
                  <span style={{ display: "block", fontSize: "0.74rem", color: "var(--tsa-muted)" }}>{opt.desc}</span>
                </span>
                <span style={{
                  width: 42, height: 24, borderRadius: 50, flexShrink: 0, position: "relative",
                  background: on ? "var(--tsa-sage)" : "var(--tsa-border)", transition: "background .2s",
                }}>
                  <span style={{
                    position: "absolute", top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: "50%",
                    background: "white", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                  }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sauvegarde des données */}
      <div className="tsa-card" style={{ marginBottom: 24 }}>
        <div className="tsa-section-title" style={{ margin: "0 0 4px" }}>🗂️ Sauvegarde & restauration</div>
        <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", margin: "0 0 14px" }}>
          Exporte toutes les données dans un fichier (sauvegarde de secours), ou restaure depuis un fichier.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="tsa-btn tsa-btn-secondary" onClick={exportJSON}>⬇️ Exporter (JSON)</button>
          <button className="tsa-btn tsa-btn-ghost" onClick={() => fileRef.current?.click()}>⬆️ Importer un fichier</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importJSON} style={{ display: "none" }} />
          {importMsg && (
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: importMsg.startsWith("✓") ? "#22c55e" : "#e53e3e" }}>{importMsg}</span>
          )}
        </div>
        <p style={{ color: "var(--tsa-muted)", fontSize: "0.74rem", margin: "12px 0 0" }}>
          ⚠️ L'import remplace toutes les données actuelles. Pense à exporter d'abord.
        </p>
      </div>

      {/* Élèves */}
      <div className="tsa-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="tsa-section-title" style={{ margin: 0 }}>👥 Gestion des élèves</div>
          <button className="tsa-btn tsa-btn-primary tsa-btn-sm" onClick={saveEleves}>
            {saved ? "✓ Sauvegardé !" : "Sauvegarder les modifications"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {eleveDraft.map((nom, i) => (
            <div key={i}>
              <label className="tsa-label">Élève {i + 1}</label>
              <input className="tsa-input" value={nom}
                onChange={e => setEleveDraft(prev => prev.map((n, j) => j === i ? e.target.value : n))} />
            </div>
          ))}
        </div>
      </div>

      {/* Activités */}
      <div className="tsa-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="tsa-section-title" style={{ margin: 0 }}>🎨 Bibliothèque d'activités</div>
          <button className="tsa-btn tsa-btn-primary tsa-btn-sm" onClick={() => setShowForm(true)}>+ Ajouter une activité</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.activites.map(act => (
            <div key={act.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              borderRadius: 10, background: act.couleur + "18", border: `2px solid ${act.couleur}22` }}>
              <span style={{ fontSize: "1.2rem" }}>{act.emoji}</span>
              <span style={{ fontWeight: 700, color: act.couleur, flex: 1 }}>{act.nom}</span>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: act.couleur }} />
              {!DEFAULT_ACTIVITES.find(d => d.id === act.id) && (
                <button className="tsa-btn tsa-btn-danger tsa-btn-sm"
                  onClick={() => dispatch({ type: "DELETE_ACTIVITE", id: act.id })}>Supprimer</button>
              )}
            </div>
          ))}
        </div>

        {showForm && (
          <div className="tsa-modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="tsa-modal">
              <div className="tsa-modal-title">+ Nouvelle activité</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label className="tsa-label">Nom de l'activité *</label>
                  <input className="tsa-input" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} /></div>
                <div><label className="tsa-label">Emoji</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setForm(p => ({ ...p, emoji: e }))}
                        style={{ fontSize: "1.4rem", padding: "4px 6px", borderRadius: 8, cursor: "pointer",
                          border: `2px solid ${form.emoji === e ? "var(--tsa-sage)" : "var(--tsa-border)"}`,
                          background: form.emoji === e ? "var(--tsa-sage-light)" : "white" }}>{e}</button>
                    ))}
                  </div>
                </div>
                <div><label className="tsa-label">Couleur</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm(p => ({ ...p, couleur: c }))}
                        style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                          border: `3px solid ${form.couleur === c ? "#2d3748" : "transparent"}` }} />
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px", borderRadius: 10, background: form.couleur + "22",
                  border: `2px solid ${form.couleur}`, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "1.4rem" }}>{form.emoji}</span>
                  <span style={{ fontWeight: 700, color: form.couleur }}>{form.nom || "Aperçu"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="tsa-btn tsa-btn-primary" onClick={addActivite}>Ajouter</button>
                  <button className="tsa-btn tsa-btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
