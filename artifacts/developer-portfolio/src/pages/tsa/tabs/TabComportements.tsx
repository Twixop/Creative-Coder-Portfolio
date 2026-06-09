import React, { useState, useMemo } from "react";
import { useTsa, Comportement, ComportementType, todayStr } from "../TsaContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TYPE_META: Record<ComportementType, { label: string; emoji: string; color: string; bg: string }> = {
  positif: { label: "Réussite / positif", emoji: "🌟", color: "#22c55e", bg: "#d4f7d4" },
  difficile: { label: "Difficulté", emoji: "⚡", color: "#e53e3e", bg: "#fed7d7" },
};

const INTENSITE_LABEL: Record<number, string> = { 1: "Légère", 2: "Modérée", 3: "Forte" };

function emptyForm(): Omit<Comportement, "id"> {
  return {
    date: todayStr(),
    heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    type: "difficile",
    intensite: 2,
    declencheur: "",
    comportement: "",
    apaisement: "",
  };
}

export default function TabComportements() {
  const { state, dispatch } = useTsa();
  const [eleveIndex, setEleveIndex] = useState(0);
  const [form, setForm] = useState<Omit<Comportement, "id">>(emptyForm());
  const [showForm, setShowForm] = useState(false);

  const entries = useMemo(
    () => (state.comportements[eleveIndex] ?? []).slice().sort((a, b) =>
      (b.date + b.heure).localeCompare(a.date + a.heure)),
    [state.comportements, eleveIndex]
  );

  const stats = useMemo(() => {
    const positifs = entries.filter(e => e.type === "positif").length;
    const difficiles = entries.filter(e => e.type === "difficile").length;
    const declCount: Record<string, number> = {};
    entries.filter(e => e.type === "difficile" && e.declencheur.trim()).forEach(e => {
      const key = e.declencheur.trim();
      declCount[key] = (declCount[key] ?? 0) + 1;
    });
    const topDecl = Object.entries(declCount)
      .map(([nom, count]) => ({ nom: nom.length > 16 ? nom.slice(0, 16) + "…" : nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return { positifs, difficiles, topDecl };
  }, [entries]);

  function addEntry() {
    if (!form.comportement.trim()) return;
    dispatch({ type: "ADD_COMPORTEMENT", index: eleveIndex, entry: { ...form, id: Date.now().toString() } });
    setForm(emptyForm());
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>📋 Journal de comportements</h2>
        <button className="tsa-btn tsa-btn-primary" onClick={() => { setForm(emptyForm()); setShowForm(true); }}>
          + Nouvelle observation
        </button>
      </div>

      {/* Sélecteur d'élève */}
      <div className="tsa-card" style={{ marginBottom: 16 }}>
        <label className="tsa-label">Élève</label>
        <select className="tsa-input" value={eleveIndex} onChange={e => setEleveIndex(Number(e.target.value))} style={{ maxWidth: 320 }}>
          {state.eleves.map((nom, i) => <option key={i} value={i}>{nom}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="tsa-grid-3" style={{ marginBottom: 16 }}>
        <div className="tsa-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#22c55e" }}>{stats.positifs}</div>
          <div style={{ color: "var(--tsa-muted)", fontWeight: 600 }}>🌟 réussites notées</div>
        </div>
        <div className="tsa-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#e53e3e" }}>{stats.difficiles}</div>
          <div style={{ color: "var(--tsa-muted)", fontWeight: 600 }}>⚡ difficultés notées</div>
        </div>
        <div className="tsa-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--tsa-sage)" }}>{entries.length}</div>
          <div style={{ color: "var(--tsa-muted)", fontWeight: 600 }}>observations au total</div>
        </div>
      </div>

      {/* Graphe déclencheurs */}
      {stats.topDecl.length > 0 && (
        <div className="tsa-card" style={{ marginBottom: 16 }}>
          <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>🔍 Déclencheurs les plus fréquents</div>
          <ResponsiveContainer width="100%" height={Math.max(120, stats.topDecl.length * 34)}>
            <BarChart data={stats.topDecl} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nom" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {stats.topDecl.map((_, i) => <Cell key={i} fill="#f6ad55" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Liste */}
      <div className="tsa-card">
        <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>🗓️ Historique — {state.eleves[eleveIndex]}</div>
        {entries.length === 0 ? (
          <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>Aucune observation pour cet élève. Clique sur « Nouvelle observation ».</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(e => {
              const meta = TYPE_META[e.type];
              return (
                <div key={e.id} style={{ borderRadius: 12, border: `2px solid ${meta.color}33`, background: meta.bg + "55", padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.1rem" }}>{meta.emoji}</span>
                    <span style={{ fontWeight: 800, color: meta.color, fontSize: "0.85rem" }}>{meta.label}</span>
                    {e.type === "difficile" && (
                      <span className="tsa-badge" style={{ background: meta.bg, color: meta.color }}>
                        Intensité : {INTENSITE_LABEL[e.intensite]}
                      </span>
                    )}
                    <span style={{ fontSize: "0.75rem", color: "var(--tsa-muted)", marginLeft: "auto" }}>{e.date} · {e.heure}</span>
                    <button className="tsa-btn tsa-btn-danger tsa-btn-sm"
                      onClick={() => dispatch({ type: "DELETE_COMPORTEMENT", index: eleveIndex, id: e.id })}>✕</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, fontSize: "0.82rem" }}>
                    {e.declencheur && <div><b>Déclencheur :</b> {e.declencheur}</div>}
                    <div><b>Comportement :</b> {e.comportement}</div>
                    {e.apaisement && <div><b>Apaisement :</b> {e.apaisement}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="tsa-modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="tsa-modal" style={{ maxWidth: 520 }}>
            <div className="tsa-modal-title">+ Observation — {state.eleves[eleveIndex]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {(["positif", "difficile"] as ComportementType[]).map(t => (
                  <button key={t} className="tsa-btn tsa-btn-sm" style={{ flex: 1,
                    background: form.type === t ? TYPE_META[t].color : "var(--tsa-border)",
                    color: form.type === t ? "white" : "var(--tsa-muted)" }}
                    onClick={() => setForm(p => ({ ...p, type: t }))}>
                    {TYPE_META[t].emoji} {TYPE_META[t].label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label className="tsa-label">Date</label>
                  <input type="date" className="tsa-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="tsa-label">Heure</label>
                  <input type="time" className="tsa-input" value={form.heure} onChange={e => setForm(p => ({ ...p, heure: e.target.value }))} />
                </div>
              </div>

              {form.type === "difficile" && (
                <div>
                  <label className="tsa-label">Intensité</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {([1, 2, 3] as const).map(n => (
                      <button key={n} className="tsa-btn tsa-btn-sm" style={{ flex: 1,
                        background: form.intensite === n ? "#e53e3e" : "var(--tsa-border)",
                        color: form.intensite === n ? "white" : "var(--tsa-muted)" }}
                        onClick={() => setForm(p => ({ ...p, intensite: n }))}>{INTENSITE_LABEL[n]}</button>
                    ))}
                  </div>
                </div>
              )}

              {form.type === "difficile" && (
                <div>
                  <label className="tsa-label">Déclencheur (situation avant)</label>
                  <input className="tsa-input" value={form.declencheur} placeholder="Ex : changement d'activité, bruit fort…"
                    onChange={e => setForm(p => ({ ...p, declencheur: e.target.value }))} />
                </div>
              )}

              <div>
                <label className="tsa-label">Comportement observé *</label>
                <textarea className="tsa-input tsa-textarea" value={form.comportement}
                  placeholder="Ce qui s'est passé…" style={{ minHeight: 60 }}
                  onChange={e => setForm(p => ({ ...p, comportement: e.target.value }))} />
              </div>

              <div>
                <label className="tsa-label">{form.type === "difficile" ? "Apaisement / réaction efficace" : "Renforcement / contexte"}</label>
                <input className="tsa-input" value={form.apaisement}
                  placeholder={form.type === "difficile" ? "Ce qui a aidé à apaiser…" : "Ce qui a favorisé la réussite…"}
                  onChange={e => setForm(p => ({ ...p, apaisement: e.target.value }))} />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="tsa-btn tsa-btn-primary" onClick={addEntry}>Enregistrer</button>
                <button className="tsa-btn tsa-btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
