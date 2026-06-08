import React, { useState } from "react";
import { useTsa, Humeur, todayStr } from "../TsaContext";

const HUMEURS: Humeur[] = ["😊", "😐", "😟", "😡", "😴"];
const HUMEUR_LABELS: Record<Humeur, string> = {
  "😊": "Bonne humeur", "😐": "Neutre", "😟": "Difficile", "😡": "Agité", "😴": "Fatigué"
};

export default function TabHumeur() {
  const { state, dispatch } = useTsa();
  const today = todayStr();
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Record<number, Humeur>>({});
  const [saved, setSaved] = useState(false);

  const absentsAujourdhui = state.eleves.map((_, i) =>
    (state.absences[i] ?? []).some(a => a.date === today)
  );

  function handleSave() {
    Object.entries(selected).forEach(([idx, humeur]) => {
      dispatch({
        type: "ADD_HUMEUR",
        index: Number(idx),
        entry: { date: today, humeur, note: notes[Number(idx)] ?? "" }
      });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 className="tsa-section-title">😊 Humeur du Jour — {today}</h2>
        <button className="tsa-btn tsa-btn-primary" onClick={handleSave}>
          {saved ? "✓ Saisie validée !" : "Valider la saisie du jour"}
        </button>
      </div>

      <div className="humeur-grid">
        {state.eleves.map((nom, i) => {
          const absent = absentsAujourdhui[i];
          const pastEntry = (state.humeurs[i] ?? []).find(h => h.date === today);
          return (
            <div key={i} className={`humeur-card${absent ? " absent" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--tsa-sage-light), var(--tsa-sky-light))",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem"
                }}>👤</div>
                <span style={{ fontWeight: 800, fontSize: "0.9rem" }}>{nom}</span>
                {absent && <span className="tsa-badge" style={{ background: "#fed7d7", color: "#c53030", marginLeft: "auto" }}>Absent</span>}
              </div>
              {!absent && (
                <>
                  <div className="humeur-options">
                    {HUMEURS.map(h => (
                      <button key={h} className={`humeur-btn${(selected[i] ?? pastEntry?.humeur) === h ? " selected" : ""}`}
                        title={HUMEUR_LABELS[h]}
                        onClick={() => setSelected(prev => ({ ...prev, [i]: h }))}>
                        {h}
                      </button>
                    ))}
                  </div>
                  <input className="tsa-input" placeholder="Note rapide (optionnel)"
                    value={notes[i] ?? pastEntry?.note ?? ""}
                    onChange={e => setNotes(prev => ({ ...prev, [i]: e.target.value }))}
                    style={{ fontSize: "0.82rem", padding: "6px 10px" }} />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Historique */}
      <div className="tsa-card" style={{ marginTop: 24 }}>
        <div className="tsa-section-title">📅 Historique des humeurs</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px 12px", textAlign: "left", background: "var(--tsa-sage-light)", color: "var(--tsa-sage)" }}>Date</th>
                {state.eleves.map((nom, i) => (
                  <th key={i} style={{ padding: "8px 12px", textAlign: "center", background: "var(--tsa-sage-light)", color: "var(--tsa-sage)" }}>{nom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(
                Object.values(state.humeurs).flatMap(entries => entries.map(e => e.date))
              )).sort().reverse().slice(0, 14).map(date => (
                <tr key={date} style={{ borderBottom: "1px solid var(--tsa-border)" }}>
                  <td style={{ padding: "6px 12px", fontWeight: 700 }}>{date}</td>
                  {state.eleves.map((_, i) => {
                    const entry = (state.humeurs[i] ?? []).find(h => h.date === date);
                    return <td key={i} style={{ textAlign: "center", fontSize: "1.2rem", padding: "6px 12px" }}>{entry?.humeur ?? "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
