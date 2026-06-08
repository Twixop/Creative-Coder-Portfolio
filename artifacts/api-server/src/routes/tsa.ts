import { Router, type IRouter } from "express";

const router: IRouter = Router();
const defaultBaseId = "appe7LRwYtNkRQwuU";
const defaultTableName = "TSA";

type AirtableRecord = { id: string; fields: Record<string, unknown> };
type AirtableResponse = { records?: AirtableRecord[] };

async function fetchRecords(token: string, baseId: string, table: string): Promise<AirtableRecord[]> {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?maxRecords=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Airtable GET failed: ${res.status}`);
  const data = (await res.json()) as AirtableResponse;
  return data.records ?? [];
}

router.get("/tsa/state", async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN_V2 || process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || defaultBaseId;
  const table = process.env.AIRTABLE_TSA_TABLE_NAME || defaultTableName;

  if (!token) { res.status(500).json({ error: "Token Airtable manquant" }); return; }

  try {
    const records = await fetchRecords(token, baseId, table);
    if (!records.length) { res.json({ state: null }); return; }
    const raw = records[0].fields["Données"] ?? records[0].fields["Donnees"] ?? records[0].fields["State"] ?? null;
    if (typeof raw !== "string") { res.json({ state: null }); return; }
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

  const fields: Record<string, string> = {
    "Données": JSON.stringify(state),
    "Date": new Date().toISOString(),
  };

  try {
    if (recordId) {
      const patchUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
      const patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ records: [{ id: recordId, fields }] }),
      });
      if (!patchRes.ok) throw new Error(`Airtable PATCH failed: ${patchRes.status} ${await patchRes.text()}`);
      const data = (await patchRes.json()) as { records?: AirtableRecord[] };
      res.json({ ok: true, recordId: data.records?.[0]?.id });
    } else {
      const records = await fetchRecords(token, baseId, table);
      if (records.length) {
        const id = records[0].id;
        const patchUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
        const patchRes = await fetch(patchUrl, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ records: [{ id, fields }] }),
        });
        if (!patchRes.ok) throw new Error(`Airtable PATCH failed: ${patchRes.status}`);
        const data = (await patchRes.json()) as { records?: AirtableRecord[] };
        res.json({ ok: true, recordId: data.records?.[0]?.id });
      } else {
        const postUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
        const postRes = await fetch(postUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ records: [{ fields }] }),
        });
        if (!postRes.ok) throw new Error(`Airtable POST failed: ${postRes.status} ${await postRes.text()}`);
        const data = (await postRes.json()) as { records?: AirtableRecord[] };
        res.json({ ok: true, recordId: data.records?.[0]?.id });
      }
    }
  } catch (err) {
    req.log.error({ err }, "TSA save failed");
    res.status(500).json({ error: "Impossible de sauvegarder les données TSA" });
  }
});

export default router;
