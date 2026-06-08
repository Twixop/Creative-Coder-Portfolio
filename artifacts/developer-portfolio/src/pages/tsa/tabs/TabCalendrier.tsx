import React, { useState } from "react";
import { useTsa, Evenement } from "../TsaContext";

const TYPE_COLORS: Record<string, string> = {
  sortie: "#3b82f6", atelier: "#f97316", bilan: "#8b5cf6", autre: "#6b7280"
};
const TYPE_LABELS = ["sortie", "atelier", "bilan", "autre"];

export default function TabCalendrier() {
  const { state, dispatch } = useTsa();
  const [current, setCurrent] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Evenement, "id">>({
    titre: "", date: "", type: "autre", description: ""
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const evByDate: Record<string, Evenement[]> = {};
  state.evenements.forEach(ev => {
    if (!evByDate[ev.date]) evByDate[ev.date] = [];
    evByDate[ev.date].push(ev);
  });

  const selectedEvs = selected ? (evByDate[selected] ?? []) : [];

  function dayStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function addEv() {
    if (!form.titre.trim() || !form.date) return;
    dispatch({ type: "ADD_EVENEMENT", ev: { ...form, id: Date.now().toString() } });
    setForm({ titre: "", date: "", type: "autre", description: "" });
    setShowForm(false);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>🗓️ Planning Mensuel</h2>
        <div className="tsa-spacer" />
        <button className="tsa-btn tsa-btn-ghost tsa-btn-sm" onClick={() => setCurrent(new Date(year, month - 1, 1))}>◀</button>
        <span style={{ fontWeight: 800, minWidth: 140, textAlign: "center" }}>
          {current.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </span>
        <button className="tsa-btn tsa-btn-ghost tsa-btn-sm" onClick={() => setCurrent(new Date(year, month + 1, 1))}>▶</button>
        <button className="tsa-btn tsa-btn-primary tsa-btn-sm" onClick={() => setShowForm(true)}>+ Événement</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: 16 }}>
        <div>
          <div className="cal-grid" style={{ marginBottom: 8 }}>
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--tsa-muted)", padding: "6px 0" }}>{d}</div>
            ))}
          </div>
          <div className="cal-grid">
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} className="cal-day other-month" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const ds = dayStr(d);
              const evs = evByDate[ds] ?? [];
              return (
                <div key={d} className="cal-day" style={{ cursor: "pointer", borderColor: selected === ds ? "var(--tsa-sage)" : undefined }}
                  onClick={() => setSelected(selected === ds ? null : ds)}>
                  <div className="cal-day-num">{d}</div>
                  {evs.slice(0, 2).map(ev => (
                    <div key={ev.id} className="cal-event"
                      style={{ background: TYPE_COLORS[ev.type] + "33", color: TYPE_COLORS[ev.type] }}>
                      {ev.titre.slice(0, 12)}
                    </div>
                  ))}
                  {evs.length > 2 && <div style={{ fontSize: "0.65rem", color: "var(--tsa-muted)" }}>+{evs.length - 2}</div>}
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            {TYPE_LABELS.map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: TYPE_COLORS[t] }} />
                {t}
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="tsa-card" style={{ alignSelf: "flex-start" }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>{selected}</div>
            {selectedEvs.length === 0
              ? <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>Aucun événement ce jour.</p>
              : selectedEvs.map(ev => (
                <div key={ev.id} style={{ marginBottom: 12, padding: "10px", borderRadius: 10,
                  borderLeft: `4px solid ${TYPE_COLORS[ev.type]}`,
                  background: TYPE_COLORS[ev.type] + "11" }}>
                  <div style={{ fontWeight: 700 }}>{ev.titre}</div>
                  <div className="tsa-badge" style={{ background: TYPE_COLORS[ev.type] + "33", color: TYPE_COLORS[ev.type], marginTop: 4 }}>{ev.type}</div>
                  {ev.description && <p style={{ fontSize: "0.82rem", color: "var(--tsa-muted)", marginTop: 6 }}>{ev.description}</p>}
                  <button className="tsa-btn tsa-btn-danger tsa-btn-sm" style={{ marginTop: 6 }}
                    onClick={() => dispatch({ type: "DELETE_EVENEMENT", id: ev.id })}>Supprimer</button>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {showForm && (
        <div className="tsa-modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="tsa-modal">
            <div className="tsa-modal-title">+ Ajouter un événement</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label className="tsa-label">Titre *</label>
                <input className="tsa-input" value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} /></div>
              <div><label className="tsa-label">Date *</label>
                <input type="date" className="tsa-input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="tsa-label">Type</label>
                <select className="tsa-input tsa-select" value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as Evenement["type"] }))}>
                  {TYPE_LABELS.map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="tsa-label">Description</label>
                <textarea className="tsa-input tsa-textarea" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="tsa-btn tsa-btn-primary" onClick={addEv}>Ajouter</button>
                <button className="tsa-btn tsa-btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
