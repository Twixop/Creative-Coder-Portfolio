import React from "react";
import { useTsa, useProfil, todayStr, CRENEAUX } from "../TsaContext";

function EleveRemplacement({ index }: { index: number }) {
  const { state } = useTsa();
  const nom = state.eleves[index];
  const profil = useProfil(index);
  const today = todayStr();
  const absent = (state.absences[index] ?? []).some(a => a.date === today);

  const keyDecl = profil.declencheurs.slice(0, 3);
  const keyStrat = profil.strategies.slice(0, 3);
  const planning = (state.plannings[today] ?? {})[index] ?? {};
  const activitesJour = CRENEAUX.filter(c => planning[c]).map(c => ({ creneau: c, act: planning[c]! }));

  return (
    <div className="rempl-card" style={{ opacity: absent ? 0.5 : 1 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--tsa-sage-light)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>👤</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{nom}</div>
          <span style={{ padding: "2px 10px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 700,
            background: profil.niveauComm === "verbal" ? "#d4f7d4" : profil.niveauComm === "semi-verbal" ? "#fef9c3" : "#fecaca",
            color: profil.niveauComm === "verbal" ? "#166534" : profil.niveauComm === "semi-verbal" ? "#92400e" : "#991b1b" }}>
            {profil.niveauComm}
          </span>
          {absent && <span style={{ marginLeft: 8, padding: "2px 10px", borderRadius: 50, fontSize: "0.78rem",
            fontWeight: 700, background: "#fed7d7", color: "#c53030" }}>Absent</span>}
        </div>
      </div>

      {keyDecl.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#c53030", marginBottom: 4 }}>⚠️ SENSIBILITÉS IMPORTANTES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {keyDecl.map((d, i) => <span key={i} className="tsa-tag tsa-tag-danger">{d}</span>)}
          </div>
        </div>
      )}

      {keyStrat.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#166534", marginBottom: 4 }}>✅ STRATÉGIES D'APAISEMENT</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {keyStrat.map((s, i) => <span key={i} className="tsa-tag">{s}</span>)}
          </div>
        </div>
      )}

      {activitesJour.length > 0 && (
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--tsa-muted)", marginBottom: 4 }}>📅 PLANNING DU JOUR</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {activitesJour.map(({ creneau, act }) => (
              <div key={creneau} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
                borderRadius: 8, background: act.couleur + "22", fontSize: "0.78rem", fontWeight: 600 }}>
                <span style={{ color: "var(--tsa-muted)", fontSize: "0.7rem" }}>{creneau}</span>
                <span>{act.emoji}</span>
                <span style={{ color: act.couleur }}>{act.nom}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TabRemplacement() {
  const { state } = useTsa();

  function printAll() { window.print(); }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 className="tsa-section-title" style={{ margin: "0 0 4px" }}>🔄 Mode Remplacement</h2>
          <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem", margin: 0 }}>Vue simplifiée • Lecture seule • Pour un remplaçant arrivant sans connaître les élèves</p>
        </div>
        <button className="tsa-btn tsa-btn-secondary" onClick={printAll}>🖨️ Imprimer la fiche</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {state.eleves.map((_, i) => <EleveRemplacement key={i} index={i} />)}
      </div>
    </div>
  );
}
