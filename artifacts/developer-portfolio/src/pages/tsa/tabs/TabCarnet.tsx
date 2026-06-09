import React, { useState } from "react";
import { useTsa, currentWeek } from "../TsaContext";
import { jsPDF } from "jspdf";

type CarnetData = { semaine: string; activites: string; positifs: string; atravailler: string; message: string };

function generateCarnetPdf(eleve: string, carnet: CarnetData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  let y = 0;

  doc.setFillColor(124, 173, 140);
  doc.rect(0, 0, W, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Carnet de liaison", margin, 16);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${eleve}  ·  Semaine du ${carnet.semaine}`, margin, 26);
  y = 48;

  const sections: { titre: string; texte: string }[] = [
    { titre: "Activites de la semaine", texte: carnet.activites },
    { titre: "Points positifs", texte: carnet.positifs },
    { titre: "Points a travailler", texte: carnet.atravailler },
    { titre: "Message aux familles", texte: carnet.message },
  ];

  doc.setTextColor(40, 40, 40);
  sections.forEach(s => {
    if (y > 250) { doc.addPage(); y = 24; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 120, 80);
    doc.text(s.titre, margin, y); y += 7;
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(s.texte.trim() || "—", W - 2 * margin);
    doc.text(lines, margin, y);
    y += lines.length * 5.5 + 8;
  });

  if (y > 255) { doc.addPage(); y = 24; }
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, W - margin, y); y += 8;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Signature de l'enseignant(e) :", margin, y);
  doc.text("Signature des parents :", W / 2 + 6, y);

  doc.save(`carnet-${eleve.replace(/\s+/g, "-")}-${carnet.semaine}.pdf`);
}

export default function TabCarnet() {
  const { state, dispatch } = useTsa();
  const [eleveIdx, setEleveIdx] = useState(0);
  const [semaine, setSemaine] = useState(currentWeek());

  const carnet = (state.carnets[eleveIdx] ?? []).find(c => c.semaine === semaine) ?? {
    semaine, activites: "", positifs: "", atravailler: "", message: ""
  };

  function update(field: string, val: string) {
    dispatch({ type: "SET_CARNET", eleveIndex: eleveIdx, semaine, entry: { [field]: val } });
  }

  const historique = (state.carnets[eleveIdx] ?? [])
    .filter(c => c.semaine !== semaine)
    .sort((a, b) => b.semaine.localeCompare(a.semaine))
    .slice(0, 5);

  return (
    <div>
      <h2 className="tsa-section-title">📝 Carnet de Liaison</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <label className="tsa-label">Élève</label>
          <select className="tsa-input tsa-select" style={{ maxWidth: 200 }} value={eleveIdx}
            onChange={e => setEleveIdx(Number(e.target.value))}>
            {state.eleves.map((n, i) => <option key={i} value={i}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="tsa-label">Semaine du</label>
          <input type="date" className="tsa-input" value={semaine}
            onChange={e => setSemaine(e.target.value)} />
        </div>
      </div>

      <div className="tsa-grid-2" style={{ marginBottom: 20 }}>
        <div className="tsa-card">
          <label className="tsa-label">🎨 Activités de la semaine</label>
          <textarea className="tsa-input tsa-textarea" style={{ minHeight: 100 }}
            value={carnet.activites}
            onChange={e => update("activites", e.target.value)}
            placeholder="Quelles activités ont été faites cette semaine ?" />
        </div>
        <div className="tsa-card">
          <label className="tsa-label">✅ Points positifs</label>
          <textarea className="tsa-input tsa-textarea" style={{ minHeight: 100 }}
            value={carnet.positifs}
            onChange={e => update("positifs", e.target.value)}
            placeholder="Progrès, moments positifs, réussites…" />
        </div>
        <div className="tsa-card">
          <label className="tsa-label">🔧 Points à travailler</label>
          <textarea className="tsa-input tsa-textarea" style={{ minHeight: 100 }}
            value={carnet.atravailler}
            onChange={e => update("atravailler", e.target.value)}
            placeholder="Axes d'amélioration, difficultés rencontrées…" />
        </div>
        <div className="tsa-card">
          <label className="tsa-label">💌 Message aux familles</label>
          <textarea className="tsa-input tsa-textarea" style={{ minHeight: 100 }}
            value={carnet.message}
            onChange={e => update("message", e.target.value)}
            placeholder="Informations, demandes, ou message général…" />
        </div>
      </div>

      <button className="tsa-btn tsa-btn-secondary" onClick={() => generateCarnetPdf(state.eleves[eleveIdx], carnet)}>
        🖨️ Générer le carnet PDF
      </button>

      {historique.length > 0 && (
        <div className="tsa-card" style={{ marginTop: 24 }}>
          <div className="tsa-section-title" style={{ fontSize: "0.95rem" }}>📚 Carnets précédents</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historique.map(c => (
              <div key={c.semaine} style={{ display: "flex", gap: 10, alignItems: "center",
                padding: "8px 12px", background: "var(--tsa-sage-light)", borderRadius: 10, cursor: "pointer" }}
                onClick={() => setSemaine(c.semaine)}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Semaine du {c.semaine}</span>
                <span style={{ color: "var(--tsa-muted)", fontSize: "0.78rem" }}>
                  {[c.activites, c.positifs, c.atravailler, c.message].filter(Boolean).length}/4 sections remplies
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
