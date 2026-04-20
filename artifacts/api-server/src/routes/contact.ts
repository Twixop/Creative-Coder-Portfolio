import { Router, type IRouter } from "express";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

type ContactInput = {
  name: string;
  email: string;
  message: string;
};

const router: IRouter = Router();
const defaultBaseId = "appe7LRwYtNkRQwuU";
const defaultContactTables = ["Contact", "Contacts", "Messages", "Message"];

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getContactTables() {
  const configuredTables = process.env.AIRTABLE_CONTACT_TABLE_NAME || process.env.AIRTABLE_CONTACT_TABLES;

  if (!configuredTables) {
    return defaultContactTables;
  }

  return configuredTables
    .split(",")
    .map((table) => table.trim())
    .filter(Boolean);
}

function validateContact(body: ContactPayload): ContactInput | null {
  const name = cleanText(body.name);
  const email = cleanText(body.email);
  const message = cleanText(body.message);

  if (!name || !email || !message) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return {
    name: name.slice(0, 120),
    email: email.slice(0, 180),
    message: message.slice(0, 4000),
  };
}

function buildFieldVariants(contact: ContactInput) {
  return [
    {
      Nom: contact.name,
      Email: contact.email,
      Message: contact.message,
    },
    {
      Name: contact.name,
      Email: contact.email,
      Message: contact.message,
    },
    {
      "Votre nom": contact.name,
      "Votre email": contact.email,
      Message: contact.message,
    },
  ];
}

async function createAirtableContact(token: string, baseId: string, contact: ContactInput) {
  const fieldVariants = buildFieldVariants(contact);
  let lastError = "Airtable contact request failed";

  for (const tableName of getContactTables()) {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);

    for (const fields of fieldVariants) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{ fields }],
          typecast: true,
        }),
      });

      if (response.ok) {
        return { tableName };
      }

      const details = await response.text();
      lastError = `${response.status}: ${details}`;

      if (response.status === 401 || response.status === 403) {
        throw new Error(lastError);
      }
    }
  }

  throw new Error(lastError);
}

router.post("/contact", async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || defaultBaseId;
  const contact = validateContact(req.body as ContactPayload);

  if (!token) {
    req.log.warn("Airtable token is missing");
    res.status(500).json({ error: "Airtable token is missing" });
    return;
  }

  if (!contact) {
    res.status(400).json({ error: "Nom, email et message valides sont requis" });
    return;
  }

  try {
    const result = await createAirtableContact(token, baseId, contact);
    req.log.info({ tableName: result.tableName }, "Contact message saved to Airtable");
    res.status(201).json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unable to save contact message to Airtable");
    res.status(502).json({
      error: "Impossible d'enregistrer le message dans Airtable. Vérifie le nom de la table Contact et ses colonnes.",
    });
  }
});

export default router;