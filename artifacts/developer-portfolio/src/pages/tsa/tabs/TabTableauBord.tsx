import React from "react";
import { useTsa, todayStr, CRENEAUX } from "../TsaContext";
import type { TsaState } from "../TsaContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";

function generatePDF(state: TsaState, today: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 15;
  let y = 0;

  function header() {
    doc.setFillColor(100, 160, 120);
    doc.rect(0, 0, W, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.text("École TSA — Tableau de Bord & Planning", margin, 14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date : ${today}`, margin, 23);
    y = 42;
    doc.setTextColor(40, 40, 40);
  }

  header();

  const absentsIdx = state.eleves.map((_, i) =>
    (state.absences[i] ?? []).some(a => a.date === today)
  );
  const absentsNoms = state.eleves.filter((_, i) => absentsIdx[i]);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 120, 80);
  doc.text("Absences du jour", margin, y); y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text(absentsNoms.length === 0 ? "Aucune absence." : absentsNoms.join(", "), margin + 2, y); y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 120, 80);
  doc.text("Humeurs du jour", margin, y); y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  state.eleves.forEach((nom, i) => {
    const h = (state.humeurs[i] ?? []).find(hh => hh.date === today);
    const absent = absentsIdx[i];
    doc.text(`${nom} : ${absent ? "absent(e)" : (h ? h.humeur + (h.note ? " — " + h.note : "") : "non saisi")}`, margin + 2, y);
    y += 5.5;
  }); y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 120, 80);
  doc.text("Planning individuel du jour", margin, y); y += 10;

  state.eleves.forEach((nom, i) => {
    if (y > 255) { doc.addPage(); y = 20; }

    const absent = absentsIdx[i];
    doc.setFillColor(absent ? 240 : 225, absent ? 240 : 245, absent ? 240 : 232);
    doc.rect(margin, y - 5, W - 2 * margin, 8, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(absent ? 150 : 40, absent ? 150 : 100, absent ? 150 : 70);
    doc.text(`${nom}${absent ? "  — ABSENT(E)" : ""}`, margin + 2, y);
    doc.setTextColor(40, 40, 40);
    y += 9;

    if (!absent) {
      const planning = (state.plannings[today] ?? {})[i] ?? {};
      const hasSomething = CRENEAUX.some(c => planning[c]);
      if (!hasSomething) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(160, 160, 160);
        doc.text("Aucune activité planifiée.", margin + 4, y);
        y += 6;
      } else {
        CRENEAUX.forEach(c => {
          const act = planning[c];
          if (!act) return;
          if (y > 280) { doc.addPage(); y = 20; }
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(120, 120, 120);
          doc.text(c, margin + 4, y);
          doc.setTextColor(40, 40, 40);
          doc.setFont("helvetica", "bold");
          doc.text(act.nom, margin + 26, y);
          y += 5;
        });
      }
    }
    y += 6;
  });

  doc.save(`planning-tsa-${today}.pdf`);
}

export default function TabTableauBord() {
  const { state, dispatch } = useTsa();
  const today = todayStr();

  const absentsAujourdhui = state.eleves.map((_, i) =>
    (state.absences[i] ?? []).some(a => a.date === today)
  );

  const humeursDuJour = state.eleves.map((_, i) =>
    (state.humeurs[i] ?? []).find(h => h.date === today)
  );

  const todayPlanning = state.plannings[today] ?? {};

  const activiteCount = Object.values(todayPlanning).reduce((acc, eleve) => {
    return acc + Object.values(eleve).filter(Boolean).length;
  }, 0);

  const activiteUsage: Record<string, number> = {};
  Object.values(todayPlanning).forEach(elevePlanning => {
    Object.values(elevePlanning).forEach(act => {
      if (act) activiteUsage[act.nom] = (activiteUsage[act.nom] ?? 0) + 1;
    });
  });
  const chartData = Object.entries(activiteUsage)
    .map(([nom, count]) => ({ nom: nom.slice(0, 12), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const sansPlanning = state.eleves.filter((_, i) =>
    !absentsAujourdhui[i] && Object.keys(todayPlanning[i] ?? {}).length === 0
  );

  const prochains = state.evenements
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  const humeurEmoji: Record<string, string> = {
    "😊": "bg:#d4f7d4", "😐": "bg:#fef9c3", "😟": "bg:#fde8d0",
    "😡": "bg:#fecaca", "😴": "bg:#e0e7ff"
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
        <h2 className="tsa-section-title" style={{ margin: 0 }}>📊 Tableau de Bord</h2>
        <button
          className="tsa-btn tsa-btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => generatePDF(state, today)}
        >
          🖨️ Imprimer en PDF
        </button>
      </div>

      {/* Absences */}
      <div className="tsa-card" style={{ marginBottom: 20 }}>
        <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>🗒️ Absences du jour — {today}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {state.eleves.map((nom, i) => (
            <label key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 50, cursor: "pointer",
              background: absentsAujourdhui[i] ? "#fed7d7" : "var(--tsa-sage-light)",
              border: "2px solid " + (absentsAujourdhui[i] ? "#fc8181" : "var(--tsa-border)"),
              fontWeight: 700, fontSize: "0.82rem", color: "#2d3748"
            }}>
              <input type="checkbox" checked={absentsAujourdhui[i]}
                onChange={e => dispatch({ type: "SET_ABSENCE", index: i, date: today, absent: e.target.checked })}
                style={{ accentColor: "#e53e3e" }} />
              {nom}
            </label>
          ))}
        </div>
      </div>

      <div className="tsa-grid-3" style={{ marginBottom: 20 }}>
        {/* Indicateurs */}
        <div className="tsa-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--tsa-sage)" }}>{activiteCount}</div>
          <div style={{ color: "var(--tsa-muted)", fontWeight: 600 }}>activités planifiées aujourd'hui</div>
        </div>
        <div className="tsa-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#e53e3e" }}>
            {absentsAujourdhui.filter(Boolean).length}
          </div>
          <div style={{ color: "var(--tsa-muted)", fontWeight: 600 }}>élève(s) absent(s)</div>
        </div>
        <div className="tsa-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--tsa-sky)" }}>
            {humeursDuJour.filter(Boolean).length}
          </div>
          <div style={{ color: "var(--tsa-muted)", fontWeight: 600 }}>humeurs saisies</div>
        </div>
      </div>

      <div className="tsa-grid-2" style={{ marginBottom: 20 }}>
        {/* Humeurs résumé */}
        <div className="tsa-card">
          <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>😊 Humeurs du jour</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {state.eleves.map((nom, i) => {
              const h = humeursDuJour[i];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "4px 10px", borderRadius: 8,
                  background: absentsAujourdhui[i] ? "#f7f7f7" : "var(--tsa-sage-light)" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{nom}</span>
                  <span style={{ fontSize: "1.2rem" }}>{absentsAujourdhui[i] ? "—" : (h?.humeur ?? "non saisi")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertes */}
        <div>
          {sansPlanning.length > 0 && (
            <div className="tsa-card" style={{ marginBottom: 16, borderLeft: "4px solid #f6ad55" }}>
              <div className="tsa-section-title" style={{ fontSize: "0.95rem", color: "#c05621" }}>
                ⚠️ Élèves sans planning aujourd'hui
              </div>
              {sansPlanning.map(n => (
                <div key={n} className="tsa-tag" style={{ marginRight: 6 }}>{n}</div>
              ))}
            </div>
          )}
          <div className="tsa-card">
            <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>📅 Prochains événements</div>
            {prochains.length === 0
              ? <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>Aucun événement planifié.</p>
              : prochains.map(ev => (
                <div key={ev.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--tsa-muted)", whiteSpace: "nowrap", marginTop: 2 }}>{ev.date}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{ev.titre}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Graphique activités */}
      {chartData.length > 0 && (
        <div className="tsa-card">
          <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>📊 Activités les plus utilisées</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="nom" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7cad8c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
