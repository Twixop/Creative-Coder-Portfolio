import React, { useState } from "react";
import { useTsa, Jalon, ProjetAnnuel } from "../TsaContext";

const MOIS = ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];

export default function TabProjetAnnuel() {
  const { state, dispatch } = useTsa();
  const [showJalon, setShowJalon] = useState(false);
  const [showProjet, setShowProjet] = useState(false);
  const [jalonForm, setJalonForm] = useState({ titre: "", date: "", description: "" });
  const [projetForm, setProjetForm] = useState<Omit<ProjetAnnuel, "id">>({
    titre: "", description: "", statut: "Planifié", responsable: "", dateCible: ""
  });

  const STATUT_COLORS: Record<ProjetAnnuel["statut"], string> = {
    "En cours": "#22c55e", "Planifié": "#3b82f6", "Idée": "#eab308"
  };

  return (
    <div>
      <h2 className="tsa-section-title">🎯 Projet Annuel</h2>

      {/* Timeline jalons */}
      <div className="tsa-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="tsa-section-title" style={{ margin: 0, fontSize: "0.95rem" }}>📅 Timeline de l'année</div>
          <button className="tsa-btn tsa-btn-primary tsa-btn-sm" onClick={() => setShowJalon(true)}>+ Jalon</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", minWidth: 700, position: "relative", padding: "20px 0" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, var(--tsa-sage), var(--tsa-sky))", borderRadius: 2 }} />
            {MOIS.map((m, i) => (
              <div key={m} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  width: 8, height: 8, borderRadius: "50%", background: "var(--tsa-sage)", border: "2px solid white" }} />
                <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)",
                  fontSize: "0.72rem", color: "var(--tsa-muted)", whiteSpace: "nowrap", fontWeight: 700 }}>{m}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {state.jalons.sort((a, b) => a.date.localeCompare(b.date)).map(j => (
              <div key={j.id} style={{ padding: "8px 14px", borderRadius: 10,
                background: "var(--tsa-sage-light)", border: "2px solid var(--tsa-border)", fontSize: "0.82rem" }}>
                <div style={{ fontWeight: 800 }}>{j.titre}</div>
                <div style={{ color: "var(--tsa-muted)", fontSize: "0.75rem" }}>{j.date}</div>
                {j.description && <div style={{ color: "var(--tsa-muted)", fontSize: "0.78rem", marginTop: 2 }}>{j.description}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projets */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="tsa-section-title" style={{ margin: 0 }}>📋 Projets</div>
        <button className="tsa-btn tsa-btn-primary tsa-btn-sm" onClick={() => setShowProjet(true)}>+ Proposer un projet</button>
      </div>

      <div className="tsa-card-grid">
        {state.projetsAnnuels.length === 0 && (
          <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>Aucun projet ajouté.</p>
        )}
        {state.projetsAnnuels.map(p => (
          <div key={p.id} className="tsa-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{p.titre}</div>
              <span className="tsa-badge" style={{ background: STATUT_COLORS[p.statut] + "22", color: STATUT_COLORS[p.statut] }}>
                {p.statut}
              </span>
            </div>
            {p.description && <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", marginBottom: 8 }}>{p.description}</p>}
            {p.responsable && <div style={{ fontSize: "0.78rem" }}>👤 {p.responsable}</div>}
            {p.dateCible && <div style={{ fontSize: "0.78rem", color: "var(--tsa-muted)" }}>📅 {p.dateCible}</div>}
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {(["En cours", "Planifié", "Idée"] as ProjetAnnuel["statut"][]).map(s => (
                <button key={s} className="tsa-btn tsa-btn-sm"
                  style={{ background: p.statut === s ? STATUT_COLORS[s] : "var(--tsa-border)", color: p.statut === s ? "white" : "var(--tsa-muted)" }}
                  onClick={() => dispatch({ type: "UPDATE_PROJET", projet: { ...p, statut: s } })}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Jalon */}
      {showJalon && (
        <div className="tsa-modal-overlay" onClick={e => e.target === e.currentTarget && setShowJalon(false)}>
          <div className="tsa-modal">
            <div className="tsa-modal-title">+ Ajouter un jalon</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label className="tsa-label">Titre</label>
                <input className="tsa-input" value={jalonForm.titre} onChange={e => setJalonForm(p => ({ ...p, titre: e.target.value }))} /></div>
              <div><label className="tsa-label">Date</label>
                <input type="date" className="tsa-input" value={jalonForm.date} onChange={e => setJalonForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="tsa-label">Description</label>
                <textarea className="tsa-input tsa-textarea" value={jalonForm.description}
                  onChange={e => setJalonForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tsa-btn tsa-btn-primary" onClick={() => {
                  if (!jalonForm.titre.trim() || !jalonForm.date) return;
                  dispatch({ type: "ADD_JALON", jalon: { ...jalonForm, id: Date.now().toString() } });
                  setJalonForm({ titre: "", date: "", description: "" });
                  setShowJalon(false);
                }}>Ajouter</button>
                <button className="tsa-btn tsa-btn-ghost" onClick={() => setShowJalon(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Projet */}
      {showProjet && (
        <div className="tsa-modal-overlay" onClick={e => e.target === e.currentTarget && setShowProjet(false)}>
          <div className="tsa-modal">
            <div className="tsa-modal-title">+ Proposer un projet</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label className="tsa-label">Titre *</label>
                <input className="tsa-input" value={projetForm.titre} onChange={e => setProjetForm(p => ({ ...p, titre: e.target.value }))} /></div>
              <div><label className="tsa-label">Description</label>
                <textarea className="tsa-input tsa-textarea" value={projetForm.description}
                  onChange={e => setProjetForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div><label className="tsa-label">Statut</label>
                <select className="tsa-input tsa-select" value={projetForm.statut}
                  onChange={e => setProjetForm(p => ({ ...p, statut: e.target.value as ProjetAnnuel["statut"] }))}>
                  <option>En cours</option><option>Planifié</option><option>Idée</option>
                </select></div>
              <div><label className="tsa-label">Responsable</label>
                <input className="tsa-input" value={projetForm.responsable} onChange={e => setProjetForm(p => ({ ...p, responsable: e.target.value }))} /></div>
              <div><label className="tsa-label">Date cible</label>
                <input type="date" className="tsa-input" value={projetForm.dateCible} onChange={e => setProjetForm(p => ({ ...p, dateCible: e.target.value }))} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tsa-btn tsa-btn-primary" onClick={() => {
                  if (!projetForm.titre.trim()) return;
                  dispatch({ type: "ADD_PROJET", projet: { ...projetForm, id: Date.now().toString() } });
                  setProjetForm({ titre: "", description: "", statut: "Planifié", responsable: "", dateCible: "" });
                  setShowProjet(false);
                }}>Ajouter</button>
                <button className="tsa-btn tsa-btn-ghost" onClick={() => setShowProjet(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
