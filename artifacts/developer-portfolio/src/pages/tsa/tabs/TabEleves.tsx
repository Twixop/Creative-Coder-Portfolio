import React, { useState } from "react";
import { useTsa, useProfil, NiveauComm, Tolerance, ProfilEleve, Objectif } from "../TsaContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COMM_COLORS: Record<NiveauComm, string> = {
  verbal: "#22c55e", "semi-verbal": "#eab308", "non-verbal": "#ef4444"
};
const TOLRANCE_OPTS: Tolerance[] = ["faible", "moyenne", "haute"];

function ProfilView({ eleveIndex, onBack }: { eleveIndex: number; onBack: () => void }) {
  const { state, dispatch } = useTsa();
  const nom = state.eleves[eleveIndex];
  const profil = useProfil(eleveIndex);
  const [nouvelObjectif, setNouvelObjectif] = useState({ titre: "", description: "" });
  const [nouveauTag, setNouveauTag] = useState<{ decl: string; strat: string }>({ decl: "", strat: "" });
  const [notes, setNotes] = useState(profil.notes);

  function setProfil(update: Partial<ProfilEleve>) {
    dispatch({ type: "SET_PROFIL", index: eleveIndex, profil: update });
  }

  function addObjectif() {
    if (!nouvelObjectif.titre.trim()) return;
    const obj: Objectif = {
      id: Date.now().toString(),
      titre: nouvelObjectif.titre,
      description: nouvelObjectif.description,
      progression: 0,
      historique: [{ date: new Date().toISOString().split("T")[0], progression: 0 }]
    };
    setProfil({ objectifs: [...profil.objectifs, obj] });
    setNouvelObjectif({ titre: "", description: "" });
  }

  function updateProgression(objId: string, val: number) {
    const updated = profil.objectifs.map(o => o.id === objId ? {
      ...o, progression: val,
      historique: [...o.historique, { date: new Date().toISOString().split("T")[0], progression: val }]
    } : o);
    setProfil({ objectifs: updated });
  }

  const humeurs = (state.humeurs[eleveIndex] ?? []).slice(-7);

  return (
    <div>
      <button className="tsa-btn tsa-btn-ghost tsa-btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Retour</button>
      <div className="tsa-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="eleve-avatar" style={{ width: 72, height: 72, fontSize: "2rem" }}>👤</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.4rem" }}>{nom}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {(["verbal", "semi-verbal", "non-verbal"] as NiveauComm[]).map(lv => (
                <button key={lv} onClick={() => setProfil({ niveauComm: lv })}
                  className="tsa-btn tsa-btn-sm"
                  style={{
                    background: profil.niveauComm === lv ? COMM_COLORS[lv] : "var(--tsa-border)",
                    color: profil.niveauComm === lv ? "white" : "var(--tsa-muted)"
                  }}>{lv}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tsa-grid-2" style={{ marginBottom: 20 }}>
        {/* Sensibilités */}
        <div className="tsa-card">
          <div className="tsa-section-title" style={{ fontSize: "0.9rem" }}>🎚️ Sensibilités</div>
          {(["bruit", "lumiere", "toucher", "foule"] as const).map(sens => (
            <div key={sens} style={{ marginBottom: 10 }}>
              <label className="tsa-label">{sens.charAt(0).toUpperCase() + sens.slice(1)}</label>
              <div style={{ display: "flex", gap: 6 }}>
                {TOLRANCE_OPTS.map(t => (
                  <button key={t} onClick={() => setProfil({ sensibilites: { ...profil.sensibilites, [sens]: t } })}
                    className="tsa-btn tsa-btn-sm"
                    style={{
                      background: profil.sensibilites[sens] === t
                        ? t === "faible" ? "#fecaca" : t === "moyenne" ? "#fef9c3" : "#d4f7d4"
                        : "var(--tsa-border)",
                      color: "var(--tsa-text)"
                    }}>{t}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Déclencheurs & Stratégies */}
        <div>
          <div className="tsa-card" style={{ marginBottom: 16 }}>
            <div className="tsa-section-title" style={{ fontSize: "0.9rem" }}>⚠️ Déclencheurs de stress</div>
            <div className="tsa-flex-wrap" style={{ marginBottom: 8 }}>
              {profil.declencheurs.map((d, i) => (
                <span key={i} className="tsa-tag tsa-tag-danger" style={{ cursor: "pointer" }}
                  onClick={() => setProfil({ declencheurs: profil.declencheurs.filter((_, j) => j !== i) })}>
                  {d} ✕
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="tsa-input" placeholder="Ajouter…" value={nouveauTag.decl}
                onChange={e => setNouveauTag(p => ({ ...p, decl: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter" && nouveauTag.decl.trim()) {
                  setProfil({ declencheurs: [...profil.declencheurs, nouveauTag.decl.trim()] });
                  setNouveauTag(p => ({ ...p, decl: "" }));
                }}} style={{ fontSize: "0.82rem" }} />
              <button className="tsa-btn tsa-btn-sm tsa-btn-primary" onClick={() => {
                if (nouveauTag.decl.trim()) {
                  setProfil({ declencheurs: [...profil.declencheurs, nouveauTag.decl.trim()] });
                  setNouveauTag(p => ({ ...p, decl: "" }));
                }
              }}>+</button>
            </div>
          </div>
          <div className="tsa-card">
            <div className="tsa-section-title" style={{ fontSize: "0.9rem" }}>✅ Stratégies d'apaisement</div>
            <div className="tsa-flex-wrap" style={{ marginBottom: 8 }}>
              {profil.strategies.map((s, i) => (
                <span key={i} className="tsa-tag" style={{ cursor: "pointer" }}
                  onClick={() => setProfil({ strategies: profil.strategies.filter((_, j) => j !== i) })}>
                  {s} ✕
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="tsa-input" placeholder="Ajouter…" value={nouveauTag.strat}
                onChange={e => setNouveauTag(p => ({ ...p, strat: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter" && nouveauTag.strat.trim()) {
                  setProfil({ strategies: [...profil.strategies, nouveauTag.strat.trim()] });
                  setNouveauTag(p => ({ ...p, strat: "" }));
                }}} style={{ fontSize: "0.82rem" }} />
              <button className="tsa-btn tsa-btn-sm tsa-btn-primary" onClick={() => {
                if (nouveauTag.strat.trim()) {
                  setProfil({ strategies: [...profil.strategies, nouveauTag.strat.trim()] });
                  setNouveauTag(p => ({ ...p, strat: "" }));
                }
              }}>+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="tsa-card" style={{ marginBottom: 20 }}>
        <div className="tsa-section-title" style={{ fontSize: "0.9rem" }}>📝 Notes libres</div>
        <textarea className="tsa-input tsa-textarea" value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={() => setProfil({ notes })}
          placeholder="Observations, informations importantes…" />
      </div>

      {/* Objectifs */}
      <div className="tsa-card" style={{ marginBottom: 20 }}>
        <div className="tsa-section-title" style={{ fontSize: "0.9rem" }}>🎯 Objectifs individuels</div>
        {profil.objectifs.map(obj => (
          <div key={obj.id} style={{ marginBottom: 16, padding: "12px", background: "var(--tsa-sage-light)", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{obj.titre}</div>
            {obj.description && <div style={{ fontSize: "0.82rem", color: "var(--tsa-muted)", marginBottom: 8 }}>{obj.description}</div>}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="range" min={0} max={100} value={obj.progression}
                onChange={e => updateProgression(obj.id, Number(e.target.value))}
                style={{ flex: 1, accentColor: "var(--tsa-sage)" }} />
              <span style={{ fontWeight: 700, minWidth: 40 }}>{obj.progression}%</span>
            </div>
            <div className="tsa-progress-bar" style={{ marginTop: 6 }}>
              <div className="tsa-progress-fill" style={{ width: `${obj.progression}%` }} />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="tsa-input" placeholder="Titre de l'objectif" value={nouvelObjectif.titre}
            onChange={e => setNouvelObjectif(p => ({ ...p, titre: e.target.value }))}
            style={{ flex: 2, fontSize: "0.85rem" }} />
          <input className="tsa-input" placeholder="Description" value={nouvelObjectif.description}
            onChange={e => setNouvelObjectif(p => ({ ...p, description: e.target.value }))}
            style={{ flex: 3, fontSize: "0.85rem" }} />
          <button className="tsa-btn tsa-btn-primary tsa-btn-sm" onClick={addObjectif}>Ajouter</button>
        </div>
      </div>

      {/* Humeur graph */}
      {humeurs.length > 1 && (
        <div className="tsa-card">
          <div className="tsa-section-title" style={{ fontSize: "0.9rem" }}>📈 Suivi humeur (7 derniers jours)</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={humeurs.map(h => ({ date: h.date, val: ["😊","😐","😟","😡","😴"].indexOf(h.humeur) }))}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 4]} tick={false} />
              <Tooltip formatter={(v: number) => ["😊","😐","😟","😡","😴"][v]} />
              <Line type="monotone" dataKey="val" stroke="var(--tsa-sage)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function TabEleves() {
  const { state } = useTsa();
  const [selected, setSelected] = useState<number | null>(null);

  if (selected !== null) return <ProfilView eleveIndex={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      <h2 className="tsa-section-title">🧒 Fiches Élèves</h2>
      <div className="eleve-card-grid">
        {state.eleves.map((nom, i) => (
          <div key={i} className="eleve-card" onClick={() => setSelected(i)}>
            <div className="eleve-avatar">👤</div>
            <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{nom}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--tsa-muted)", marginTop: 4 }}>Voir la fiche</div>
          </div>
        ))}
      </div>
    </div>
  );
}
