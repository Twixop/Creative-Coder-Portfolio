import React from "react";

function ProfileCard({ role, emoji, nom, description, extra }: {
  role: string; emoji: string; nom: string; description: string; extra?: React.ReactNode;
}) {
  return (
    <div className="tsa-card" style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--tsa-sage-light), var(--tsa-sky-light))",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
          border: "3px solid var(--tsa-border)", flexShrink: 0
        }}>{emoji}</div>
        <div>
          <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>{nom}</div>
          <div className="tsa-badge" style={{ background: "var(--tsa-sage-light)", color: "var(--tsa-sage)", marginTop: 4 }}>{role}</div>
        </div>
      </div>
      <p style={{ color: "var(--tsa-muted)", lineHeight: 1.6, fontSize: "0.9rem" }}>{description}</p>
      {extra}
    </div>
  );
}

export function TabEnseignante() {
  return (
    <div>
      <h2 className="tsa-section-title">👩‍🏫 Enseignante</h2>
      <ProfileCard
        role="Enseignante spécialisée TSA"
        emoji="👩‍🏫"
        nom="Pauline Bocquillon"
        description="Enseignante spécialisée avec 9 ans d'expérience auprès d'élèves et 1 an avec des troubles du spectre autistique. Formée aux approches TEACCH, ABA et PECS, elle croit profondément en le potentiel de chaque enfant et adapte son enseignement à chaque profil sensoriel et cognitif."
        extra={
          <div>
            <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 16 }}>🎓 Formations & Certifications</div>
            {["Certificat TEACCH — Université de Caroline du Nord", "Formation ABA niveau avancé — AFFORTHECC", "DU Autisme — Faculté de Médecine Paris VI"].map(f => (
              <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, fontSize: "0.85rem" }}>
                <span style={{ color: "var(--tsa-sage)" }}>✓</span> {f}
              </div>
            ))}
            <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 16 }}>💡 Philosophie pédagogique</div>
            <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              "Chaque enfant progresse à son rythme. Mon rôle est de créer un environnement prévisible, rassurant, et stimulant — où chaque petite victoire est célébrée."
            </p>
            <div style={{ marginTop: 12, fontSize: "0.85rem" }}>
              📧 <a href="mailto:m.lefevre@ecole-tsa.fr" style={{ color: "var(--tsa-sage)" }}>Pau.boc@hotmail.fr</a>
            </div>
          </div>
        }
      />
    </div>
  );
}

const aeshList = [
  {
    nom: "Sophie Martin",
    emoji: "🤝",
    description: "Accompagnante depuis 5 ans, spécialisée TSA. Travaille en étroite collaboration avec l'enseignante pour adapter supports et activités à chaque élève.",
    eleves: "4 élèves",
    horaires: "Lun–Ven, 8h30 → 16h00",
    email: "s.martin@ecole-tsa.fr",
  },
  {
    nom: "Clara Dupont",
    emoji: "🌸",
    description: "Accompagnante depuis 3 ans, formée aux outils de communication alternative (PECS, pictogrammes). Spécialisée dans la gestion sensorielle et la régulation émotionnelle.",
    eleves: "3 élèves",
    horaires: "Lun–Jeu, 8h30 → 15h30",
    email: "c.dupont@ecole-tsa.fr",
  },
  {
    nom: "Nadia Bensalem",
    emoji: "⭐",
    description: "Accompagnante depuis 2 ans, avec une formation en éducation spécialisée. Elle assure un soutien à la socialisation et à l'autonomie lors des activités collectives.",
    eleves: "3 élèves",
    horaires: "Mar–Ven, 9h00 → 16h00",
    email: "n.bensalem@ecole-tsa.fr",
  },
];

export function TabAESH() {
  return (
    <div>
      <h2 className="tsa-section-title">🤝 AESH
        <span className="tsa-tooltip" style={{ marginLeft: 8, cursor: "help" }}>
          ℹ️
          <span className="tsa-tooltip-text">L'AESH (Accompagnant·e des Élèves en Situation de Handicap) aide les élèves TSA à participer pleinement à la vie scolaire en leur apportant une aide humaine individualisée.</span>
        </span>
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {aeshList.map((a) => (
          <ProfileCard
            key={a.nom}
            role="AESH — Accompagnante"
            emoji={a.emoji}
            nom={a.nom}
            description={a.description}
            extra={
              <div>
                <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 16 }}>📋 Élèves accompagnés</div>
                <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>{a.eleves} (noms anonymisés — RGPD)</p>
                <div className="tsa-section-title" style={{ fontSize: "0.9rem", marginTop: 16 }}>🕐 Horaires</div>
                <p style={{ color: "var(--tsa-muted)", fontSize: "0.85rem" }}>{a.horaires}</p>
                <div style={{ marginTop: 12, fontSize: "0.85rem" }}>
                  📧 <a href={`mailto:${a.email}`} style={{ color: "var(--tsa-sage)" }}>{a.email}</a>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
