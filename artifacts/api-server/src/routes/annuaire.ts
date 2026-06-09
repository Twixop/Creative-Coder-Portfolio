import { Router, type IRouter } from "express";

const router: IRouter = Router();
const BASE_ID = "appe7LRwYtNkRQwuU";
const TABLE_NAME = "Annuaire";

type AirtableTool = {
  id: string;
  fields: Record<string, unknown>;
};

export type Tool = {
  id: string;
  nom: string;
  categorie: string;
  departement: string;
  description: string;
  fonctions: string;
  contact: string;
  lienDoc: string;
  statut: "Actif" | "Inactif" | "En test";
};

/* Données d'exemple utilisées quand la table Airtable n'existe pas encore */
const SAMPLE_TOOLS: Tool[] = [
  {
    id: "sample-1", nom: "Slack", categorie: "Communication", departement: "Transversal",
    description: "Messagerie instantanée collaborative pour toutes les équipes.",
    fonctions: "Canaux thématiques, partage de fichiers, intégrations tierces, fils de discussion, appels vidéo.",
    contact: "admin@company.com", lienDoc: "https://slack.com/help", statut: "Actif",
  },
  {
    id: "sample-2", nom: "Notion", categorie: "Documentation", departement: "Transversal",
    description: "Espace de travail tout-en-un pour notes, wikis et bases de données.",
    fonctions: "Pages collaboratives, bases de données, gestion de projet, templates, IA intégrée.",
    contact: "rh@company.com", lienDoc: "https://notion.so/help", statut: "Actif",
  },
  {
    id: "sample-3", nom: "Figma", categorie: "Design", departement: "Design / Marketing",
    description: "Outil de design d'interfaces et de prototypage collaboratif en ligne.",
    fonctions: "Maquettes UI, prototypes interactifs, design system, collaboration temps réel.",
    contact: "design@company.com", lienDoc: "https://help.figma.com", statut: "Actif",
  },
  {
    id: "sample-4", nom: "GitHub", categorie: "Développement", departement: "Tech",
    description: "Plateforme d'hébergement et de gestion de code source avec outils DevOps.",
    fonctions: "Versioning Git, CI/CD, code review, issues, wikis, actions automatisées.",
    contact: "tech@company.com", lienDoc: "https://docs.github.com", statut: "Actif",
  },
  {
    id: "sample-5", nom: "Airtable", categorie: "Base de données", departement: "Transversal",
    description: "Base de données no-code collaborative avec interface tableur avancée.",
    fonctions: "Gestion de projets, CRM, automatisations, vues multiples, API REST.",
    contact: "ops@company.com", lienDoc: "https://support.airtable.com", statut: "Actif",
  },
  {
    id: "sample-6", nom: "Make", categorie: "Automatisation", departement: "Transversal",
    description: "Plateforme no-code pour automatiser des flux entre applications.",
    fonctions: "Connexion d'API, déclencheurs, transformations de données, webhooks.",
    contact: "ops@company.com", lienDoc: "https://www.make.com/en/help", statut: "En test",
  },
  {
    id: "sample-7", nom: "Trello", categorie: "Gestion de projet", departement: "Direction",
    description: "Gestion de projets visuelle en tableaux Kanban simples et intuitifs.",
    fonctions: "Cartes, listes, étiquettes, power-ups, calendrier, automatisations Butler.",
    contact: "direction@company.com", lienDoc: "https://help.trello.com", statut: "Inactif",
  },
  {
    id: "sample-8", nom: "Zoom", categorie: "Communication", departement: "Transversal",
    description: "Solution de visioconférence pour réunions et webinaires en ligne.",
    fonctions: "Appels vidéo HD, partage d'écran, salles de sous-groupes, enregistrement cloud.",
    contact: "admin@company.com", lienDoc: "https://support.zoom.us", statut: "Actif",
  },
];

function mapRecord(rec: AirtableTool): Tool {
  const f = rec.fields;
  const str = (keys: string[], fallback = "") => {
    for (const k of keys) {
      const v = f[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return fallback;
  };
  const rawStatut = str(["Statut"]);
  const statut: Tool["statut"] =
    rawStatut === "Inactif" ? "Inactif" : rawStatut === "En test" ? "En test" : "Actif";
  return {
    id: rec.id,
    nom: str(["Nom", "Name"]),
    categorie: str(["Catégorie", "Categorie", "Category"]),
    departement: str(["Département", "Departement", "Department"]),
    description: str(["Description"]),
    fonctions: str(["Fonctions", "Functions"]),
    contact: str(["Contact"]),
    lienDoc: str(["Lien documentation", "Lien", "Documentation", "URL"]),
    statut,
  };
}

/* GET /api/annuaire — liste tous les outils (admin protégé par ADMIN_SECRET) */
router.get("/annuaire", async (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "Annuaire non disponible : ADMIN_SECRET non configuré." });
    return;
  }
  const provided =
    (req.headers["x-admin-secret"] as string | undefined) ??
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (provided !== adminSecret) {
    res.status(401).json({ error: "Accès non autorisé. Secret admin incorrect." });
    return;
  }

  const token = process.env.AIRTABLE_TOKEN_V2 || process.env.AIRTABLE_TOKEN;
  if (!token) {
    res.json({ tools: SAMPLE_TOOLS, source: "sample" });
    return;
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?pageSize=100`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (!r.ok) {
      req.log.warn({ status: r.status }, "Annuaire table not found, using sample data");
      res.json({ tools: SAMPLE_TOOLS, source: "sample" });
      return;
    }

    const data = (await r.json()) as { records?: AirtableTool[] };
    const tools = (data.records ?? []).map(mapRecord);
    res.json({ tools: tools.length > 0 ? tools : SAMPLE_TOOLS, source: tools.length > 0 ? "airtable" : "sample" });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch Annuaire");
    res.json({ tools: SAMPLE_TOOLS, source: "sample" });
  }
});

/* POST /api/annuaire — ajoute un outil (admin protégé par ADMIN_SECRET) */
router.post("/annuaire", async (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(503).json({ error: "Annuaire non disponible : ADMIN_SECRET non configuré." });
    return;
  }
  const provided =
    (req.headers["x-admin-secret"] as string | undefined) ??
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (provided !== adminSecret) {
    res.status(401).json({ error: "Accès non autorisé. Secret admin incorrect." });
    return;
  }

  const token = process.env.AIRTABLE_TOKEN_V2 || process.env.AIRTABLE_TOKEN;
  if (!token) {
    res.status(500).json({ error: "Token Airtable non configuré." });
    return;
  }

  const { nom, categorie, departement, description, fonctions, contact, lienDoc, statut } = req.body as Partial<Tool>;
  if (!nom?.trim()) {
    res.status(400).json({ error: "Le champ Nom est requis." });
    return;
  }

  try {
    const r = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        records: [{
          fields: {
            Nom: nom.trim(),
            "Catégorie": categorie?.trim() || "",
            "Département": departement?.trim() || "",
            Description: description?.trim() || "",
            Fonctions: fonctions?.trim() || "",
            Contact: contact?.trim() || "",
            "Lien documentation": lienDoc?.trim() || "",
            Statut: statut || "Actif",
          },
        }],
      }),
    });

    if (!r.ok) {
      const details = await r.text();
      req.log.error({ status: r.status, details }, "Airtable POST Annuaire failed");
      res.status(502).json({ error: "Impossible d'écrire dans Airtable. La table Annuaire existe-t-elle ?" });
      return;
    }

    const created = (await r.json()) as { records: AirtableTool[] };
    const tool = mapRecord(created.records[0]);
    res.status(201).json({ tool });
  } catch (err) {
    req.log.error({ err }, "Failed to create Annuaire record");
    res.status(500).json({ error: "Erreur lors de la création de l'outil." });
  }
});

export default router;
