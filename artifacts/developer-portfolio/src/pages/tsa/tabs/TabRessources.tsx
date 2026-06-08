import React, { useState } from "react";

const METHODES = [
  {
    nom: "TEACCH",
    emoji: "🏗️",
    couleur: "#3b82f6",
    desc: "Structuration de l'environnement et des tâches pour favoriser l'autonomie et la compréhension. Approche recommandée par la HAS.",
    lien: "https://www.has-sante.fr/jcms/c_1191932/fr/autisme-et-autres-troubles-envahissants-du-developpement-interventions-educatives-et-therapeutiques-coordonnees",
    lienLabel: "Recommandations HAS →",
  },
  {
    nom: "ABA",
    emoji: "📊",
    couleur: "#22c55e",
    desc: "Analyse Appliquée du Comportement — renforcement positif pour développer les compétences et réduire les comportements difficiles.",
    lien: "https://www.autisme-france.fr",
    lienLabel: "Autisme France →",
  },
  {
    nom: "PECS",
    emoji: "🖼️",
    couleur: "#f97316",
    desc: "Système de Communication par Échange d'Images — pour les enfants non-verbaux ou avec peu de langage oral.",
    lien: "https://www.pecs-france.fr",
    lienLabel: "PECS France →",
  },
  {
    nom: "Makaton",
    emoji: "🤟",
    couleur: "#8b5cf6",
    desc: "Programme de langage utilisant des signes, des symboles et la parole pour faciliter la communication.",
    lien: "https://www.makaton.fr",
    lienLabel: "Makaton France →",
  },
];

const LIENS_UTILES = [
  { nom: "Autisme France", emoji: "🏛️", desc: "Association nationale de référence pour les familles et professionnels", lien: "https://www.autisme-france.fr" },
  { nom: "Autisme Info Service", emoji: "📞", desc: "Ligne nationale d'information — 0 800 71 40 40 (gratuit)", lien: "https://www.autismeinfoservice.fr" },
  { nom: "Scolariser les élèves autistes", emoji: "🏫", desc: "Guide Éduscol pour la scolarisation des élèves avec TSA", lien: "https://eduscol.education.fr/2355/scolariser-les-eleves-autistes-ou-avec-des-troubles-envahissants-du-developpement" },
  { nom: "Réseau National des CRA", emoji: "🗺️", desc: "Centres de Ressources Autisme — un par région", lien: "https://www.craif.org" },
  { nom: "CNSA — Autonomie & Handicap", emoji: "📋", desc: "Informations sur les droits, l'AAH, la MDPH", lien: "https://www.cnsa.fr" },
  { nom: "Sesame Autisme", emoji: "🌱", desc: "Fédération nationale d'associations de familles", lien: "https://www.sesame-autisme.com" },
];

const OUTILS = [
  { nom: "Boardmaker", desc: "Création de supports pictographiques personnalisés", emoji: "🎨", lien: "https://www.tobiidynavox.com/fr-fr/software/boardmaker/" },
  { nom: "WidgitOnline", desc: "Symboles et pictogrammes accessibles en ligne", emoji: "🖼️", lien: "https://widgitonline.com/fr" },
  { nom: "Proloquo2Go", desc: "Communication augmentée sur iPad — AAC", emoji: "📱", lien: "https://www.assistiveware.com/products/proloquo2go" },
  { nom: "Pictosélect", desc: "Bibliothèque de pictogrammes en français", emoji: "🔤", lien: "https://www.pictoselect.com" },
  { nom: "ARASAAC", desc: "Pictogrammes gratuits en français — ressource internationale", emoji: "🖼️", lien: "https://arasaac.org/index.php?lang=fr" },
  { nom: "Choix de classe", desc: "Ressources et fiches pratiques pour classes spécialisées", emoji: "📁", lien: "https://www.choixdeclasse.fr" },
];

const FAQ = [
  { q: "Comment se passe la scolarisation d'un enfant TSA ?", r: "L'enfant est accueilli dans une classe spécialisée avec un enseignant formé et un AESH. Un PPS (Projet Personnalisé de Scolarisation) est mis en place avec la famille et l'équipe pluridisciplinaire, en lien avec la MDPH." },
  { q: "Quel est le rôle de l'AESH ?", r: "L'Accompagnant·e des Élèves en Situation de Handicap aide l'élève dans les gestes quotidiens, la communication et la participation aux activités scolaires. Son action est définie dans le PPS." },
  { q: "Quelles méthodes sont utilisées en classe ?", r: "Nous utilisons principalement TEACCH pour la structuration de l'environnement, PECS pour la communication alternative, et des supports visuels inspirés du Makaton." },
  { q: "Comment aider mon enfant à la maison ?", r: "La cohérence entre la maison et l'école est essentielle. Des supports visuels (emplois du temps illustrés), des routines prévisibles et la valorisation des réussites sont les clés principales." },
  { q: "Qu'est-ce que le PPS ?", r: "Le Projet Personnalisé de Scolarisation est le document qui fixe les objectifs pédagogiques, les aménagements et les soutiens mis en place pour l'élève. Il est révisé chaque année avec la MDPH." },
  { q: "Comment contacter la MDPH ?", r: "La Maison Départementale des Personnes Handicapées est l'organisme à contacter pour les droits, allocations (AAH) et le PPS. Chaque département dispose de la sienne — accessible sur mairie ou departement.fr." },
];

export default function TabRessources() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      <h2 className="tsa-section-title">📚 Ressources & Outils</h2>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>🧠 Méthodes pédagogiques recommandées</div>
      <div className="tsa-card-grid" style={{ marginBottom: 28 }}>
        {METHODES.map(m => (
          <a key={m.nom} href={m.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="tsa-card" style={{ borderTop: `4px solid ${m.couleur}`, cursor: "pointer", transition: "transform 0.2s", height: "100%" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>{m.emoji}</div>
              <div style={{ fontWeight: 800, color: m.couleur, marginBottom: 6 }}>{m.nom}</div>
              <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", lineHeight: 1.5, margin: 0, flex: 1 }}>{m.desc}</p>
              <div style={{ marginTop: 10, fontSize: "0.78rem", color: m.couleur, fontWeight: 700 }}>{m.lienLabel}</div>
            </div>
          </a>
        ))}
      </div>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>🔗 Sites & associations utiles</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginBottom: 28 }}>
        {LIENS_UTILES.map(l => (
          <a key={l.nom} href={l.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="tsa-card" style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{l.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--tsa-sage)", marginBottom: 4 }}>{l.nom}</div>
                <p style={{ color: "var(--tsa-muted)", fontSize: "0.8rem", margin: 0, lineHeight: 1.4 }}>{l.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>🛠️ Outils numériques recommandés</div>
      <div className="tsa-card-grid" style={{ marginBottom: 28 }}>
        {OUTILS.map(o => (
          <a key={o.nom} href={o.lien} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="tsa-card" style={{ cursor: "pointer", transition: "transform 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{o.emoji}</div>
              <div style={{ fontWeight: 800, marginBottom: 4, color: "var(--tsa-text)" }}>{o.nom}</div>
              <p style={{ color: "var(--tsa-muted)", fontSize: "0.82rem", margin: 0 }}>{o.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="tsa-section-title" style={{ fontSize: "0.95rem", marginBottom: 12 }}>❓ FAQ — Questions fréquentes</div>
      <div className="tsa-card">
        {FAQ.map((f, i) => (
          <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? "1px solid var(--tsa-border)" : "none" }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: "100%", textAlign: "left", padding: "14px 0", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", color: "var(--tsa-text)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit", gap: 12 }}>
              <span>{f.q}</span>
              <span style={{ color: "var(--tsa-sage)", fontSize: "1.2rem", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
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
