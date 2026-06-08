import React, { useState } from "react";

const METHODES = [
  { nom: "TEACCH", emoji: "🏗️", couleur: "#3b82f6", desc: "Structuration de l'environnement et des tâches pour favoriser l'autonomie et la compréhension.", lien: "https://teacch.com" },
  { nom: "ABA", emoji: "📊", couleur: "#22c55e", desc: "Analyse Appliquée du Comportement — renforcement positif pour développer les compétences.", lien: "https://www.autism.org/aba/" },
  { nom: "PECS", emoji: "🖼️", couleur: "#f97316", desc: "Système de Communication par Échange d'Images — pour les enfants non-verbaux.", lien: "https://pecsusa.com" },
  { nom: "Makaton", emoji: "🤟", couleur: "#8b5cf6", desc: "Programme de langage utilisant des signes, des symboles et la parole.", lien: "https://www.makaton.fr" },
];

const OUTILS = [
  { nom: "Boardmaker", desc: "Création de supports picto-graphiques personnalisés", emoji: "🎨" },
  { nom: "WidgitOnline", desc: "Symboles et pictogrammes accessibles en ligne", emoji: "🖼️" },
  { nom: "Proloquo2Go", desc: "Communication augmentée sur iPad", emoji: "📱" },
  { nom: "Classe tactile", desc: "Tableau interactif adapté TSA", emoji: "🖥️" },
];

const FAQ = [
  { q: "Comment se passe la scolarisation d'un enfant TSA ?", r: "L'enfant est accueilli dans une classe spécialisée avec un enseignant formé et un AESH. Un PPS (Projet Personnalisé de Scolarisation) est mis en place avec la famille et l'équipe pluridisciplinaire." },
  { q: "Quel est le rôle de l'AESH ?", r: "L'Accompagnant·e des Élèves en Situation de Handicap aide l'élève dans les gestes quotidiens, la communication et la participation aux activités scolaires." },
  { q: "Quelles méthodes sont utilisées en classe ?", r: "Nous utilisons principalement TEACCH pour la structuration, PECS pour la communication et Makaton pour soutenir le langage verbal." },
  { q: "Comment aider mon enfant à la maison ?", r: "La cohérence entre la maison et l'école est essentielle. Des supports visuels, des routines prévisibles et la valorisation des réussites sont les clés." },
];

export default function TabRessources() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      <h2 className="tsa-section-title">📚 Ressources & Outils</h2>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>🧠 Méthodes pédagogiques</div>
      <div className="tsa-card-grid" style={{ marginBottom: 24 }}>
        {METHODES.map(m => (
          <a key={m.nom} href={m.lien} target="_blank" rel="noopener noreferrer"
            style={{ textDecoration: "none" }}>
            <div className="tsa-card" style={{ borderTop: `4px solid ${m.couleur}`, cursor: "pointer", transition: "transform 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{m.emoji}</div>
              <div style={{ fontWeight: 800, color: m.couleur, marginBottom: 6 }}>{m.nom}</div>
              <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>{m.desc}</p>
              <div style={{ marginTop: 10, fontSize: "0.78rem", color: m.couleur, fontWeight: 700 }}>Voir le site →</div>
            </div>
          </a>
        ))}
      </div>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>🛠️ Outils numériques recommandés</div>
      <div className="tsa-card-grid" style={{ marginBottom: 24 }}>
        {OUTILS.map(o => (
          <div key={o.nom} className="tsa-card">
            <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{o.emoji}</div>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>{o.nom}</div>
            <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", margin: 0 }}>{o.desc}</p>
          </div>
        ))}
      </div>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>❓ FAQ Parents</div>
      <div className="tsa-card">
        {FAQ.map((f, i) => (
          <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? "1px solid var(--tsa-border)" : "none" }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: "100%", textAlign: "left", padding: "14px 0", background: "none", border: "none",
                cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", color: "var(--tsa-text)",
                display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
              {f.q}
              <span style={{ color: "var(--tsa-sage)", fontSize: "1.2rem" }}>{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && (
              <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem", lineHeight: 1.6, marginTop: 0, paddingBottom: 12 }}>{f.r}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
