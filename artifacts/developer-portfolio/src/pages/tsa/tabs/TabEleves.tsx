import React, { useState } from "react";
import { useTsa, useProfil, NiveauComm, Tolerance, ProfilEleve, Objectif, ObjectifStatut } from "../TsaContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COMM_COLORS: Record<NiveauComm, string> = {
  verbal: "#22c55e", "semi-verbal": "#eab308", "non-verbal": "#ef4444"
};
const TOLRANCE_OPTS: Tolerance[] = ["faible", "moyenne", "haute"];

const STATUT_META: Record<ObjectifStatut, { label: string; color: string; bg: string }> = {
  "non-acquis": { label: "Non acquis", color: "#e53e3e", bg: "#fed7d7" },
  "en-cours": { label: "En cours", color: "#c05621", bg: "#feebc8" },
  "acquis": { label: "Acquis", color: "#22c55e", bg: "#d4f7d4" },
};
const STATUTS: ObjectifStatut[] = ["non-acquis", "en-cours", "acquis"];

const AVATAR_EMOJIS = ["🧒", "👦", "👧", "🧑", "🐢", "🦊", "🐰", "🐱", "🐶", "🦄", "🌟", "🚀", "🌈", "🐬", "🦋", "🌻"];

function resizeImageToDataUrl(file: File, max = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AvatarDisplay({ avatar, photo, size = 72 }: { avatar?: string; photo?: string; size?: number }) {
  if (photo) {
    return (
      <div className="eleve-avatar" style={{ width: size, height: size, padding: 0, overflow: "hidden" }}>
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  return <div className="eleve-avatar" style={{ width: size, height: size, fontSize: size * 0.45 }}>{avatar || "👤"}</div>;
}

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
      statut: o.statut ?? (val >= 100 ? "acquis" : val > 0 ? "en-cours" : "non-acquis"),
      historique: [...o.historique, { date: new Date().toISOString().split("T")[0], progression: val }]
    } : o);
    setProfil({ objectifs: updated });
  }

  function updateStatut(objId: string, statut: ObjectifStatut) {
    const updated = profil.objectifs.map(o => o.id === objId ? { ...o, statut } : o);
    setProfil({ objectifs: updated });
  }

  function deleteObjectif(objId: string) {
    setProfil({ objectifs: profil.objectifs.filter(o => o.id !== objId) });
  }

  const humeurs = (state.humeurs[eleveIndex] ?? []).slice(-7);

  return (
    <div>
      <button className="tsa-btn tsa-btn-ghost tsa-btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Retour</button>
      <div className="tsa-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AvatarDisplay avatar={profil.avatar} photo={profil.photo} size={72} />
            <div style={{ display: "flex", gap: 4 }}>
              <label className="tsa-btn tsa-btn-ghost tsa-btn-sm" style={{ cursor: "pointer", fontSize: "0.68rem" }} title="Importer une photo" aria-label="Importer une photo">
                📷
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async e => {
                    const f = e.target.files?.[0];
                    if (f) { try { setProfil({ photo: await resizeImageToDataUrl(f) }); } catch { /* ignore */ } }
                    e.target.value = "";
                  }} />
              </label>
              {(profil.photo || profil.avatar) && (
                <button className="tsa-btn tsa-btn-ghost tsa-btn-sm" style={{ fontSize: "0.68rem" }}
                  title="Réinitialiser l'avatar" aria-label="Réinitialiser l'avatar" onClick={() => setProfil({ photo: undefined, avatar: undefined })}>↺</button>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 130, justifyContent: "center" }}>
              {AVATAR_EMOJIS.map(em => (
                <button key={em} onClick={() => setProfil({ avatar: em, photo: undefined })}
                  title={`Choisir l'avatar ${em}`} aria-label={`Choisir l'avatar ${em}`}
                  aria-pressed={profil.avatar === em && !profil.photo}
                  style={{ border: "none", background: profil.avatar === em && !profil.photo ? "var(--tsa-sage-light)" : "transparent",
                    borderRadius: 6, cursor: "pointer", fontSize: "1.05rem", padding: "1px 3px", lineHeight: 1.1 }}>{em}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.4rem" }}>{nom}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--tsa-muted)" }}>🎂 Anniversaire</label>
              <input
                type="date"
                className="tsa-input"
                value={profil.anniversaire ?? ""}
                onChange={e => setProfil({ anniversaire: e.target.value })}
                style={{ fontSize: "0.85rem", padding: "4px 10px", width: "auto" }}
              />
              {profil.anniversaire && (
                <span style={{ fontSize: "0.82rem", color: "var(--tsa-sage)", fontWeight: 700 }}>
                  {new Date(profil.anniversaire).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </span>
              )}
            </div>
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
        {profil.objectifs.map(obj => {
          const statut = obj.statut ?? (obj.progression >= 100 ? "acquis" : obj.progression > 0 ? "en-cours" : "non-acquis");
          const sm = STATUT_META[statut];
          const histo = (obj.historique ?? []).slice(-10).map(h => ({ date: h.date.slice(5), progression: h.progression }));
          return (
            <div key={obj.id} style={{ marginBottom: 16, padding: "12px", background: "var(--tsa-sage-light)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{obj.titre}</div>
                  {obj.description && <div style={{ fontSize: "0.82rem", color: "var(--tsa-muted)", marginBottom: 8 }}>{obj.description}</div>}
                </div>
                <span className="tsa-badge" style={{ background: sm.bg, color: sm.color, whiteSpace: "nowrap" }}>{sm.label}</span>
                <button className="tsa-btn tsa-btn-danger tsa-btn-sm" onClick={() => deleteObjectif(obj.id)}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {STATUTS.map(s => (
                  <button key={s} className="tsa-btn tsa-btn-sm"
                    style={{ background: statut === s ? STATUT_META[s].color : "var(--tsa-border)",
                      color: statut === s ? "white" : "var(--tsa-muted)", fontSize: "0.72rem" }}
                    onClick={() => updateStatut(obj.id, s)}>{STATUT_META[s].label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="range" min={0} max={100} value={obj.progression}
                  onChange={e => updateProgression(obj.id, Number(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--tsa-sage)" }} />
                <span style={{ fontWeight: 700, minWidth: 40 }}>{obj.progression}%</span>
              </div>
              <div className="tsa-progress-bar" style={{ marginTop: 6 }}>
                <div className="tsa-progress-fill" style={{ width: `${obj.progression}%` }} />
              </div>
              {histo.length > 1 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--tsa-muted)", marginBottom: 2 }}>Évolution</div>
                  <ResponsiveContainer width="100%" height={90}>
                    <LineChart data={histo} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="progression" stroke="var(--tsa-sage)" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h2 className="tsa-section-title">🧒 Fiches Élèves</h2>
      <div className="eleve-card-grid">
        {state.eleves.map((nom, i) => {
          const profil = state.profils[i];
          const anniv = profil?.anniversaire;
          const isToday = anniv && anniv.slice(5) === today.slice(5);
          return (
            <div key={i} className="eleve-card" onClick={() => setSelected(i)}
              style={{ position: "relative" }}>
              {isToday && (
                <div style={{ position: "absolute", top: 8, right: 8, fontSize: "1.2rem" }} title="Anniversaire aujourd'hui !">🎂</div>
              )}
              <AvatarDisplay avatar={profil?.avatar} photo={profil?.photo} size={56} />
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>{nom}</div>
              {anniv ? (
                <div style={{ fontSize: "0.75rem", color: isToday ? "#e53e3e" : "var(--tsa-muted)", marginTop: 4, fontWeight: isToday ? 700 : 400 }}>
                  🎂 {new Date(anniv).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  {isToday && " — Aujourd'hui !"}
                </div>
              ) : (
                <div style={{ fontSize: "0.75rem", color: "var(--tsa-muted)", marginTop: 4 }}>Voir la fiche</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
