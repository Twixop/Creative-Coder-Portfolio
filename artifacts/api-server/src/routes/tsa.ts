import { Router, type IRouter } from "express";

const router: IRouter = Router();
const defaultBaseId = "appe7LRwYtNkRQwuU";
const defaultTableName = "TSA";

type AirtableRecord = { id: string; fields: Record<string, unknown> };
type AirtableResponse = { records?: AirtableRecord[] };

async function fetchRecords(token: string, baseId: string, table: string): Promise<AirtableRecord[]> {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?maxRecords=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Airtable GET failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as AirtableResponse;
  return data.records ?? [];
}

function readState(record: AirtableRecord): string | null {
  const candidates = ["Notes", "Données", "Donnees", "State", "Data", "JSON", "Name", "Nom"];
  for (const c of candidates) {
    const v = record.fields[c];
    if (typeof v === "string" && v.trim().startsWith("{")) return v;
  }
  return null;
}

function makeLabel(): string {
  const now = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `État École TSA — sauvegarde du ${now}`;
}

router.get("/tsa/state", async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN_V2 || process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || defaultBaseId;
  const table = process.env.AIRTABLE_TSA_TABLE_NAME || defaultTableName;
  if (!token) { res.status(500).json({ error: "Token Airtable manquant" }); return; }
  try {
    const records = await fetchRecords(token, baseId, table);
    if (!records.length) { res.json({ state: null }); return; }
    const raw = readState(records[0]);
    if (!raw) { res.json({ state: null }); return; }
    res.json({ state: JSON.parse(raw), recordId: records[0].id });
  } catch (err) {
    req.log.error({ err }, "TSA load failed");
    res.status(500).json({ error: "Impossible de charger les données TSA" });
  }
});

router.post("/tsa/state", async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN_V2 || process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || defaultBaseId;
  const table = process.env.AIRTABLE_TSA_TABLE_NAME || defaultTableName;
  if (!token) { res.status(500).json({ error: "Token Airtable manquant" }); return; }
  const { state, recordId } = req.body as { state: unknown; recordId?: string };
  if (!state) { res.status(400).json({ error: "state manquant dans le body" }); return; }

  const json = JSON.stringify(state);
  const airtableBase = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function tryPatch(id: string, fields: Record<string, string>): Promise<{ ok: boolean; id?: string; unknownField?: string }> {
    const r = await fetch(airtableBase, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ records: [{ id, fields }] }),
    });
    if (r.ok) {
      const data = (await r.json()) as { records?: AirtableRecord[] };
      return { ok: true, id: data.records?.[0]?.id ?? id };
    }
    const body = await r.text();
    if (r.status === 422 && body.includes("UNKNOWN_FIELD_NAME")) {
      return { ok: false, unknownField: body };
    }
    throw new Error(`Airtable PATCH failed: ${r.status} ${body}`);
  }

  async function tryPost(fields: Record<string, string>): Promise<{ ok: boolean; id?: string; unknownField?: string }> {
    const r = await fetch(airtableBase, {
      method: "POST",
      headers,
      body: JSON.stringify({ records: [{ fields }] }),
    });
    if (r.ok) {
      const data = (await r.json()) as { records?: AirtableRecord[] };
      const newId = data.records?.[0]?.id;
      if (!newId) throw new Error("Airtable POST returned no record id");
      return { ok: true, id: newId };
    }
    const body = await r.text();
    if (r.status === 422 && body.includes("UNKNOWN_FIELD_NAME")) {
      return { ok: false, unknownField: body };
    }
    throw new Error(`Airtable POST failed: ${r.status} ${body}`);
  }

  try {
    const existing = await fetchRecords(token, baseId, table);
    const existingRecord = existing[0] ?? null;
    const targetId = recordId || existingRecord?.id;

    const label = makeLabel();
    const fieldSets: Record<string, string>[] = [
      { "Name": label, "Notes": json },
      { "Notes": json },
      { "Name": label, "Données": json },
      { "Données": json },
      { "Name": json },
      { "Nom": json },
    ];

    let finalId: string | undefined;
    for (const fields of fieldSets) {
      const result = targetId
        ? await tryPatch(targetId, fields)
        : await tryPost(fields);
      if (result.ok) {
        finalId = result.id;
        break;
      }
    }

    if (!finalId) throw new Error("Tous les champs ont été rejetés par Airtable");
    res.json({ ok: true, recordId: finalId });
  } catch (err) {
    req.log.error({ err }, "TSA save failed");
    res.status(500).json({ error: "Impossible de sauvegarder les données TSA" });
  }
});

export default router;
