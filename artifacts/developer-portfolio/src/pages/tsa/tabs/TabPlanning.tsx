import React, { useState } from "react";
import { useTsa, CRENEAUX, Activite, todayStr } from "../TsaContext";

function prevDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
function nextDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function formatDateFR(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function TabPlanning() {
  const { state, dispatch } = useTsa();
  const [vue, setVue] = useState<"globale" | "individuelle">("globale");
  const [eleveSelect, setEleveSelect] = useState(0);
  const [dragging, setDragging] = useState<Activite | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [planningDate, setPlanningDate] = useState(todayStr());
  const today = todayStr();

  const dayPlanning = state.plannings[planningDate] ?? {};

  const absentsJour = state.eleves.map((_, i) =>
    (state.absences[i] ?? []).some(a => a.date === planningDate)
  );

  function handleDrop(eleveIdx: number, creneau: string) {
    if (!dragging) return;
    dispatch({ type: "SET_PLANNING_CELL", date: planningDate, eleve: eleveIdx, creneau, activite: dragging });
    setDragging(null);
  }

  function handleClear(eleveIdx: number, creneau: string) {
    dispatch({ type: "SET_PLANNING_CELL", date: planningDate, eleve: eleveIdx, creneau, activite: null });
  }

  const datesAvecPlanning = Object.keys(state.plannings).sort().reverse();

  const content = (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>📅 Organisation Journalière</h2>
        <div className="tsa-spacer" />
        <button className={`tsa-btn tsa-btn-sm ${vue === "globale" ? "tsa-btn-primary" : "tsa-btn-ghost"}`} onClick={() => setVue("globale")}>Vue globale</button>
        <button className={`tsa-btn tsa-btn-sm ${vue === "individuelle" ? "tsa-btn-primary" : "tsa-btn-ghost"}`} onClick={() => setVue("individuelle")}>Vue individuelle</button>
        <button className="tsa-btn tsa-btn-sm tsa-btn-danger" onClick={() => { if (confirm("Vider tout le planning du " + formatDateFR(planningDate) + " ? Cette action ne touche que ce jour.")) dispatch({ type: "RESET_PLANNING", date: planningDate }); }}>🗑️ Vider ce jour</button>
        <button className="tsa-btn tsa-btn-sm tsa-btn-secondary" onClick={() => setFullscreen(true)}>🖥️ Plein écran</button>
      </div>

      {/* Sélecteur de date */}
      <div className="tsa-card" style={{ marginBottom: 16, padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="tsa-btn tsa-btn-sm tsa-btn-ghost" onClick={() => setPlanningDate(prevDay(planningDate))}>◀</button>
          <input type="date" className="tsa-input" value={planningDate}
            onChange={e => setPlanningDate(e.target.value)}
            style={{ fontSize: "0.9rem", padding: "5px 10px", width: "auto", fontWeight: 700 }} />
          <button className="tsa-btn tsa-btn-sm tsa-btn-ghost" onClick={() => setPlanningDate(nextDay(planningDate))}>▶</button>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--tsa-sage)", textTransform: "capitalize" }}>
            {formatDateFR(planningDate)}
          </span>
          {planningDate !== today && (
            <button className="tsa-btn tsa-btn-sm tsa-btn-secondary" onClick={() => setPlanningDate(today)}>Aujourd'hui</button>
          )}
          {datesAvecPlanning.length > 0 && (
            <select className="tsa-input tsa-select" style={{ fontSize: "0.82rem", padding: "4px 8px", width: "auto" }}
              value=""
              onChange={e => { if (e.target.value) setPlanningDate(e.target.value); }}>
              <option value="">📋 Voir un autre jour…</option>
              {datesAvecPlanning.map(d => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {vue === "individuelle" && (
        <div style={{ marginBottom: 16 }}>
          <select className="tsa-input tsa-select" style={{ maxWidth: 220 }}
            value={eleveSelect} onChange={e => setEleveSelect(Number(e.target.value))}>
            {state.eleves.map((nom, i) => <option key={i} value={i}>{nom}</option>)}
          </select>
        </div>
      )}

      <div className="planning-layout">
        {/* Sidebar bibliothèque */}
        <div className="planning-sidebar">
          <div style={{ fontWeight: 800, fontSize: "0.85rem", marginBottom: 12, color: "var(--tsa-muted)" }}>📚 BIBLIOTHÈQUE</div>
          {state.activites.map(act => (
            <div key={act.id} className="activite-item"
              draggable
              onDragStart={() => setDragging(act)}
              onDragEnd={() => setDragging(null)}
              style={{ background: act.couleur + "22", borderLeft: `3px solid ${act.couleur}` }}>
              <span>{act.emoji}</span>
              <span style={{ color: act.couleur, fontWeight: 700 }}>{act.nom}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="planning-table-wrap">
          {vue === "globale" ? (
            <table className="planning-table">
              <thead>
                <tr>
                  <th>Horaire</th>
                  {state.eleves.map((nom, i) => (
                    <th key={i} style={{ opacity: absentsJour[i] ? 0.4 : 1 }}>{nom}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRENEAUX.map(creneau => (
                  <tr key={creneau}>
                    <td>{creneau}</td>
                    {state.eleves.map((_, i) => {
                      const act = dayPlanning[i]?.[creneau];
                      const absent = absentsJour[i];
                      return (
                        <td key={i}
                          style={{ background: absent ? "#f0f0f0" : undefined }}
                          onDragOver={e => { if (!absent) e.preventDefault(); }}
                          onDrop={() => !absent && handleDrop(i, creneau)}
                          onDoubleClick={() => !absent && act && handleClear(i, creneau)}
                          title={act ? `${act.nom} (double-clic pour effacer)` : absent ? "Absent" : "Déposer une activité"}>
                          {act && !absent && (
                            <div className="planning-cell" style={{ background: act.couleur + "22" }}>
                              <span>{act.emoji}</span>
                              <span style={{ color: act.couleur, fontSize: "0.7rem" }}>{act.nom.slice(0, 10)}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 16, color: "var(--tsa-text)" }}>Planning de {state.eleves[eleveSelect]}</h3>
              {CRENEAUX.map(creneau => {
                const act = dayPlanning[eleveSelect]?.[creneau];
                return (
                  <div key={creneau} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6,
                    padding: "8px 12px", borderRadius: 10,
                    background: act ? act.couleur + "22" : "var(--tsa-sage-light)",
                    borderLeft: `4px solid ${act ? act.couleur : "var(--tsa-border)"}` }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(eleveSelect, creneau)}
                    onDoubleClick={() => act && handleClear(eleveSelect, creneau)}>
                    <span style={{ fontWeight: 700, color: "var(--tsa-muted)", minWidth: 45, fontSize: "0.85rem" }}>{creneau}</span>
                    {act ? (
                      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{act.emoji} {act.nom}</span>
                    ) : (
                      <span style={{ color: "var(--tsa-muted)", fontSize: "0.82rem" }}>— Déposer une activité</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="tsa-fullscreen" style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 900 }}>📅 {formatDateFR(planningDate)}</div>
          <button className="tsa-btn tsa-btn-ghost" onClick={() => setFullscreen(false)}>✕ Quitter le plein écran</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {state.eleves.map((nom, i) => (
            <div key={i} className="tsa-card">
              <div style={{ fontWeight: 900, fontSize: "1.1rem", marginBottom: 10 }}>{nom}</div>
              {CRENEAUX.map(c => {
                const act = dayPlanning[i]?.[c];
                return act ? (
                  <div key={c} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: "1rem" }}>
                    <span style={{ color: "var(--tsa-muted)", fontSize: "0.8rem", minWidth: 40 }}>{c}</span>
                    <span style={{ fontSize: "1.4rem" }}>{act.emoji}</span>
                    <span style={{ fontWeight: 700 }}>{act.nom}</span>
                  </div>
                ) : null;
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return content;
}
