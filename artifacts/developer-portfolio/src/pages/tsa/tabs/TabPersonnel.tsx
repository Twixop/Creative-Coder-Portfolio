import React, { useState } from "react";

type Enseignante = {
  nom: string;
  role: string;
  emoji: string;
  description: string;
  email: string;
  certifications: string;
  philosophie: string;
};

type AeshEntry = {
  id: string;
  nom: string;
  role: string;
  emoji: string;
  description: string;
  eleves: string;
  horaires: string;
  email: string;
};

const DEFAULT_ENSEIGNANTE: Enseignante = {
  nom: "Pauline Bocquillon",
  role: "Enseignante spécialisée TSA",
  emoji: "👩‍🏫",
  description: "Enseignante spécialisée avec 9 ans d'expérience auprès d'élèves et 1 an avec des troubles du spectre autistique. Formée aux approches TEACCH, ABA et PECS, elle croit profondément en le potentiel de chaque enfant et adapte son enseignement à chaque profil sensoriel et cognitif.",
  email: "Pau.boc@hotmail.fr",
  certifications: "Certificat TEACCH — Université de Caroline du Nord\nFormation ABA niveau avancé — AFFORTHECC\nDU Autisme — Faculté de Médecine Paris VI",
  philosophie: "Chaque enfant progresse à son rythme. Mon rôle est de créer un environnement prévisible, rassurant, et stimulant — où chaque petite victoire est célébrée.",
};

const DEFAULT_AESH: AeshEntry[] = [
  { id: "1", nom: "Sophie Martin", role: "AESH — Accompagnante", emoji: "🤝", description: "Accompagnante depuis 5 ans, spécialisée TSA. Travaille en étroite collaboration avec l'enseignante pour adapter supports et activités à chaque élève.", eleves: "4 élèves", horaires: "Lun–Ven, 8h30 → 16h00", email: "s.martin@ecole-tsa.fr" },
  { id: "2", nom: "Clara Dupont", role: "AESH — Accompagnante", emoji: "🌸", description: "Accompagnante depuis 3 ans, formée aux outils de communication alternative (PECS, pictogrammes). Spécialisée dans la gestion sensorielle et la régulation émotionnelle.", eleves: "3 élèves", horaires: "Lun–Jeu, 8h30 → 15h30", email: "c.dupont@ecole-tsa.fr" },
  { id: "3", nom: "Nadia Bensalem", role: "AESH — Accompagnante", emoji: "⭐", description: "Accompagnante depuis 2 ans, avec une formation en éducation spécialisée. Elle assure un soutien à la socialisation et à l'autonomie lors des activités collectives.", eleves: "3 élèves", horaires: "Mar–Ven, 9h00 → 16h00", email: "n.bensalem@ecole-tsa.fr" },
];

const EMOJIS = ["🤝", "🌸", "⭐", "💚", "🌻", "🦋", "🌈", "🎯", "💛", "🌿"];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.1rem", color: "var(--tsa-text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--tsa-muted)", lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontWeight: 700, fontSize: "0.82rem", color: "var(--tsa-muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

export function TabEnseignante() {
  const [data, setData] = useState<Enseignante>(DEFAULT_ENSEIGNANTE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Enseignante>(data);

  function openEdit() { setDraft({ ...data }); setEditing(true); }
  function save() { setData(draft); setEditing(false); }

  const certs = data.certifications.split("\n").filter(Boolean);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>👩‍🏫 Enseignante</h2>
        <button className="tsa-btn tsa-btn-sm tsa-btn-secondary" onClick={openEdit}>✏️ Modifier la fiche</button>
      </div>

      <div className="tsa-card" style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--tsa-sage-light), var(--tsa-sky-light))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", border: "3px solid var(--tsa-border)", flexShrink: 0 }}>{data.emoji}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--tsa-text)" }}>{data.nom}</div>
            <div className="tsa-badge" style={{ background: "var(--tsa-sage-light)", color: "var(--tsa-sage)", marginTop: 4 }}>{data.role}</div>
          </div>
        </div>
        <p style={{ color: "var(--tsa-muted)", lineHeight: 1.6, fontSize: "0.9rem" }}>{data.description}</p>

        {certs.length > 0 && (
          <>
            <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 16 }}>🎓 Formations & Certifications</div>
            {certs.map(f => (
              <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: "0.85rem", color: "var(--tsa-text)" }}>
                <span style={{ color: "var(--tsa-sage)" }}>✓</span> {f}
              </div>
            ))}
          </>
        )}

        {data.philosophie && (
          <>
            <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 16 }}>💡 Philosophie pédagogique</div>
            <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>"{data.philosophie}"</p>
          </>
        )}

        {data.email && (
          <div style={{ marginTop: 12, fontSize: "0.85rem" }}>
            📧 <a href={`mailto:${data.email}`} style={{ color: "var(--tsa-sage)" }}>{data.email}</a>
          </div>
        )}
      </div>

      {editing && (
        <Modal title="✏️ Modifier la fiche enseignante" onClose={() => setEditing(false)}>
          <Field label="Emoji">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["👩‍🏫", "🧑‍🏫", "👨‍🏫", "🌱", "⭐", "💚", "🎯"].map(e => (
                <button key={e} onClick={() => setDraft(d => ({ ...d, emoji: e }))}
                  style={{ fontSize: "1.4rem", padding: "4px 8px", borderRadius: 8, border: draft.emoji === e ? "2px solid var(--tsa-sage)" : "2px solid transparent", background: draft.emoji === e ? "var(--tsa-sage-light)" : "transparent", cursor: "pointer" }}>
                  {e}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Nom complet">
            <input className="tsa-input" value={draft.nom} onChange={e => setDraft(d => ({ ...d, nom: e.target.value }))} style={{ width: "100%" }} />
          </Field>
          <Field label="Rôle / titre">
            <input className="tsa-input" value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))} style={{ width: "100%" }} />
          </Field>
          <Field label="Description">
            <textarea className="tsa-input" rows={3} value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} style={{ width: "100%", resize: "vertical" }} />
          </Field>
          <Field label="Certifications (une par ligne)">
            <textarea className="tsa-input" rows={4} value={draft.certifications} onChange={e => setDraft(d => ({ ...d, certifications: e.target.value }))} style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }} />
          </Field>
          <Field label="Philosophie pédagogique">
            <textarea className="tsa-input" rows={3} value={draft.philosophie} onChange={e => setDraft(d => ({ ...d, philosophie: e.target.value }))} style={{ width: "100%", resize: "vertical" }} />
          </Field>
          <Field label="Email">
            <input className="tsa-input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} style={{ width: "100%" }} />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button className="tsa-btn tsa-btn-ghost" onClick={() => setEditing(false)}>Annuler</button>
            <button className="tsa-btn tsa-btn-primary" onClick={save}>✓ Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function TabAESH() {
  const [list, setList] = useState<AeshEntry[]>(DEFAULT_AESH);
  const [editTarget, setEditTarget] = useState<AeshEntry | null>(null);
  const [adding, setAdding] = useState(false);

  const emptyEntry = (): AeshEntry => ({ id: Date.now().toString(), nom: "", role: "AESH — Accompagnante", emoji: "🤝", description: "", eleves: "", horaires: "", email: "" });

  function openAdd() { setEditTarget(emptyEntry()); setAdding(true); }
  function openEdit(a: AeshEntry) { setEditTarget({ ...a }); setAdding(false); }

  function save() {
    if (!editTarget) return;
    if (adding) {
      setList(l => [...l, editTarget]);
    } else {
      setList(l => l.map(a => a.id === editTarget.id ? editTarget : a));
    }
    setEditTarget(null);
  }

  function remove(id: string) {
    if (confirm("Supprimer cette fiche ?")) setList(l => l.filter(a => a.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>🤝 Personnel d'accompagnement
          <span className="tsa-tooltip" style={{ marginLeft: 8, cursor: "help" }}>
            ℹ️
            <span className="tsa-tooltip-text">AESH (Accompagnant·e des Élèves en Situation de Handicap), AVS et tout autre personnel d'accompagnement de la classe.</span>
          </span>
        </h2>
        <button className="tsa-btn tsa-btn-sm tsa-btn-primary" onClick={openAdd}>➕ Ajouter une fiche</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {list.map(a => (
          <div key={a.id} className="tsa-card" style={{ maxWidth: 480, position: "relative" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--tsa-sage-light), var(--tsa-sky-light))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", border: "3px solid var(--tsa-border)", flexShrink: 0 }}>{a.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "var(--tsa-text)" }}>{a.nom}</div>
                <div className="tsa-badge" style={{ background: "var(--tsa-sage-light)", color: "var(--tsa-sage)", marginTop: 4 }}>{a.role}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="tsa-btn tsa-btn-sm tsa-btn-secondary" onClick={() => openEdit(a)} title="Modifier">✏️</button>
                <button className="tsa-btn tsa-btn-sm tsa-btn-danger" onClick={() => remove(a.id)} title="Supprimer">🗑️</button>
              </div>
            </div>
            <p style={{ color: "var(--tsa-muted)", lineHeight: 1.6, fontSize: "0.9rem" }}>{a.description}</p>
            {a.eleves && (
              <>
                <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 12 }}>📋 Élèves accompagnés</div>
                <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>{a.eleves} (noms anonymisés — RGPD)</p>
              </>
            )}
            {a.horaires && (
              <>
                <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 8 }}>🕐 Horaires</div>
                <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>{a.horaires}</p>
              </>
            )}
            {a.email && (
              <div style={{ marginTop: 10, fontSize: "0.85rem" }}>
                📧 <a href={`mailto:${a.email}`} style={{ color: "var(--tsa-sage)" }}>{a.email}</a>
              </div>
            )}
          </div>
        ))}

        {list.length === 0 && (
          <div className="tsa-card" style={{ color: "var(--tsa-muted)", fontStyle: "italic" }}>
            Aucune fiche. Cliquez sur "Ajouter une fiche" pour commencer.
          </div>
        )}
      </div>

      {editTarget && (
        <Modal title={adding ? "➕ Ajouter une fiche" : "✏️ Modifier la fiche"} onClose={() => setEditTarget(null)}>
          <Field label="Emoji">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEditTarget(d => d ? { ...d, emoji: e } : d)}
                  style={{ fontSize: "1.4rem", padding: "4px 8px", borderRadius: 8, border: editTarget.emoji === e ? "2px solid var(--tsa-sage)" : "2px solid transparent", background: editTarget.emoji === e ? "var(--tsa-sage-light)" : "transparent", cursor: "pointer" }}>
                  {e}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Nom complet">
            <input className="tsa-input" value={editTarget.nom} onChange={e => setEditTarget(d => d ? { ...d, nom: e.target.value } : d)} style={{ width: "100%" }} />
          </Field>
          <Field label="Rôle (ex: AESH, AVS, Éducateur·rice…)">
            <input className="tsa-input" value={editTarget.role} onChange={e => setEditTarget(d => d ? { ...d, role: e.target.value } : d)} style={{ width: "100%" }} />
          </Field>
          <Field label="Description">
            <textarea className="tsa-input" rows={3} value={editTarget.description} onChange={e => setEditTarget(d => d ? { ...d, description: e.target.value } : d)} style={{ width: "100%", resize: "vertical" }} />
          </Field>
          <Field label="Élèves accompagnés">
            <input className="tsa-input" value={editTarget.eleves} placeholder="ex: 3 élèves" onChange={e => setEditTarget(d => d ? { ...d, eleves: e.target.value } : d)} style={{ width: "100%" }} />
          </Field>
          <Field label="Horaires">
            <input className="tsa-input" value={editTarget.horaires} placeholder="ex: Lun–Ven, 8h30 → 16h00" onChange={e => setEditTarget(d => d ? { ...d, horaires: e.target.value } : d)} style={{ width: "100%" }} />
          </Field>
          <Field label="Email">
            <input className="tsa-input" type="email" value={editTarget.email} onChange={e => setEditTarget(d => d ? { ...d, email: e.target.value } : d)} style={{ width: "100%" }} />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button className="tsa-btn tsa-btn-ghost" onClick={() => setEditTarget(null)}>Annuler</button>
            <button className="tsa-btn tsa-btn-primary" onClick={save}>✓ Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
