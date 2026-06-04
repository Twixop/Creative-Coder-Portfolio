import { Router, type IRouter } from "express";

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableResponse = {
  records?: AirtableRecord[];
};

type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  stack: string[];
  demoUrl: string;
  codeUrl: string;
};

const router: IRouter = Router();
const defaultBaseId = "appe7LRwYtNkRQwuU";
const defaultTableName = "Projet";

function readText(fields: Record<string, unknown>, names: string[], fallback: string) {
  for (const name of names) {
    const value = fields[name];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readStack(fields: Record<string, unknown>) {
  const value = fields["Stack"] ?? fields["Tech"] ?? fields["Technologies"] ?? fields["Technos"];

  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return ["HTML", "CSS", "JavaScript"];
}

function mapRecord(record: AirtableRecord): PortfolioProject {
  const { fields } = record;

  return {
    id: record.id,
    name: readText(fields, ["Nom", "Name", "Titre", "Title", "Projet", "Project"], "Projet sans titre"),
    description: readText(
      fields,
      ["Ma Solution", "Solution", "Description", "Desc", "Résumé", "Resume", "Summary", "Détails", "Détail", "Detail"],
      "Description à compléter dans Airtable.",
    ),
    stack: readStack(fields),
    demoUrl: readText(fields, ["Demo", "Démo", "DemoUrl", "Demo URL", "Lien", "URL"], "https://example.com"),
    codeUrl: readText(fields, ["Code", "GitHub", "Github", "Repo", "Repository"], "https://github.com/Twixop/Creative-Coder-Portfolio"),
  };
}

router.get("/projects", async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || defaultBaseId;
  const tableName = process.env.AIRTABLE_TABLE_NAME || defaultTableName;

  req.log.info({ tokenPrefix: token ? token.slice(0, 14) : "ABSENT" }, "Airtable token check");

  if (!token) {
    req.log.warn("Airtable token is missing");
    res.status(500).json({ error: "Airtable token is missing" });
    return;
  }

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
  url.searchParams.set("pageSize", "12");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const details = await response.text();
      req.log.error({ status: response.status, details }, "Airtable request failed");
      res.status(response.status).json({ error: "Airtable request failed" });
      return;
    }

    const data = (await response.json()) as AirtableResponse;
    const projects = (data.records ?? []).map(mapRecord);

    res.json({ projects });
  } catch (err) {
    req.log.error({ err }, "Unable to fetch Airtable projects");
    res.status(500).json({ error: "Unable to fetch Airtable projects" });
  }
});

export default router;
