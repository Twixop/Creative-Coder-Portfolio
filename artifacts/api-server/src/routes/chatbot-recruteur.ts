import { Router, type IRouter } from "express";
import type { Logger } from "pino";
import { sendChatbotAlert } from "../lib/mailer";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const router: IRouter = Router();
const defaultBaseId = "appe7LRwYtNkRQwuU";
const defaultChatbotTables = ["Chatbot", "Chatbots", "Conversations", "Recrutement"];

const systemPrompt = `Tu es "Recrut'IA", un chatbot recruteur intelligent et bienveillant pour Twixop.
Tu joues le rôle d'un premier filtre RH conversationnel:
- Tu accueilles le candidat avec énergie et lui présentes brièvement le rôle proposé (par défaut, "Développeur·se Web Junior" en alternance ou stage).
- Tu poses UNE question à la fois pour qualifier le candidat: prénom, expérience, technologies maîtrisées (HTML/CSS/JS, React, Node, etc.), projets récents, disponibilité, mobilité, prétentions.
- Tu réponds aux questions classiques sur l'entreprise (culture, télétravail, salaire, process).
- À la fin tu donnes un score de compatibilité sur 100 et une recommandation claire (à rappeler / à mettre en attente / non aligné), puis tu remercies le candidat.
- Toujours en français, ton chaleureux mais professionnel, phrases courtes, emojis utilisés avec parcimonie.
- Si on te demande un sujet hors recrutement, recadre poliment vers le process candidat.`;

function getChatbotTables() {
  const configured = process.env.AIRTABLE_CHATBOT_TABLE_NAME || process.env.AIRTABLE_CHATBOT_TABLES;
  if (!configured) {
    return defaultChatbotTables;
  }
  return configured
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function detectCandidateName(messages: ChatMessage[]) {
  const firstUser = messages.find((m) => m.role === "user")?.content ?? "";
  const namePattern = /(?:je m'appelle|moi c['’]est|je suis|c['’]est)\s+([A-Z][\p{L}\-']{1,30}(?:\s+[A-Z][\p{L}\-']{1,30})?)/iu;
  const match = firstUser.match(namePattern);
  if (match?.[1]) {
    return match[1].trim();
  }
  const fallback = firstUser.trim().split(/[.!?\n]/)[0]?.slice(0, 60).trim();
  return fallback || "Candidat anonyme";
}

function detectScore(messages: ChatMessage[]) {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const match = lastAssistant.match(/(\d{1,3})\s*\/\s*100/);
  if (!match) {
    return null;
  }
  const score = Number(match[1]);
  if (Number.isNaN(score) || score < 0 || score > 100) {
    return null;
  }
  return score;
}

function formatTranscript(messages: ChatMessage[]) {
  return messages
    .map((message) => {
      const author = message.role === "user" ? "Candidat" : "Recrut'IA";
      return `${author}: ${message.content}`;
    })
    .join("\n\n");
}

function buildFieldVariants(params: {
  candidat: string;
  transcript: string;
  score: number | null;
  date: string;
}) {
  const { candidat, transcript, score, date } = params;
  const baseFrench: Record<string, string | number> = {
    Candidat: candidat,
    Conversation: transcript,
    Date: date,
  };
  const baseEnglish: Record<string, string | number> = {
    Name: candidat,
    Transcript: transcript,
    Date: date,
  };
  if (score !== null) {
    baseFrench.Score = score;
    baseEnglish.Score = score;
  }
  return [
    baseFrench,
    baseEnglish,
    { Nom: candidat, Échange: transcript, Date: date, ...(score !== null ? { Score: score } : {}) },
    { Candidat: candidat, Messages: transcript, Date: date, ...(score !== null ? { Score: score } : {}) },
  ];
}

async function saveTranscript(params: {
  log: Logger;
  recordId: string | null;
  messages: ChatMessage[];
}) {
  const token = process.env.AIRTABLE_TOKEN_V2 || process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || defaultBaseId;
  if (!token) {
    params.log.warn("Airtable token missing, skipping chatbot transcript save");
    return null;
  }

  const candidat = detectCandidateName(params.messages);
  const transcript = formatTranscript(params.messages).slice(0, 100000);
  const score = detectScore(params.messages);
  const date = new Date().toISOString();
  const variants = buildFieldVariants({ candidat, transcript, score, date });
  let lastError = "Airtable transcript save failed";

  for (const tableName of getChatbotTables()) {
    const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
    for (const fields of variants) {
      const url = params.recordId ? `${baseUrl}/${params.recordId}` : baseUrl;
      const method = params.recordId ? "PATCH" : "POST";
      const body = params.recordId
        ? JSON.stringify({ fields, typecast: true })
        : JSON.stringify({ records: [{ fields }], typecast: true });

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      });

      if (response.ok) {
        const data = (await response.json()) as
          | { id?: string; records?: Array<{ id: string }> }
          | undefined;
        const id = data?.id || data?.records?.[0]?.id || params.recordId;
        return id ? { recordId: id, tableName } : null;
      }

      const details = await response.text();
      lastError = `${response.status}: ${details}`;
      if (response.status === 401 || response.status === 403) {
        params.log.error({ tableName, lastError }, "Airtable rejected chatbot transcript request");
        return null;
      }
    }
  }

  params.log.warn({ lastError }, "Could not save chatbot transcript to Airtable");
  return null;
}

/* Rate limiter en mémoire : max 10 messages / 15 min par IP */
const rateMap = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string): boolean {
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000;
  const LIMIT = 10;
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

router.post("/chatbot-recruteur", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
  if (!checkRate(ip)) {
    res.status(429).json({ error: "Trop de messages envoyés. Réessaie dans quelques minutes." });
    return;
  }

  const baseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;

  if (!baseUrl || !apiKey) {
    req.log.warn("Anthropic AI integration is missing");
    res.status(500).json({ error: "AI integration not configured" });
    return;
  }

  const body = req.body as { messages?: ChatMessage[]; recordId?: string | null };
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const recordId = typeof body.recordId === "string" && body.recordId ? body.recordId : null;

  const messages = incoming
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role,
      content: typeof message.content === "string" ? message.content.slice(0, 4000) : "",
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-20);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    res.status(400).json({ error: "Le dernier message doit venir du candidat." });
    return;
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 8192,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      req.log.error({ status: response.status, details }, "Anthropic request failed");
      res.status(502).json({ error: "Le chatbot recruteur est momentanément indisponible." });
      return;
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const reply = (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text as string)
      .join("\n")
      .trim();

    const finalReply = reply || "Désolé, je n'ai pas réussi à formuler ma réponse. Pouvez-vous reformuler ?";

    const allMessages: ChatMessage[] = [...messages, { role: "assistant" as const, content: finalReply }];

    const saveResult = await saveTranscript({
      log: req.log,
      recordId,
      messages: allMessages,
    });

    /* Alerte email uniquement quand le chatbot annonce un score (fin d'entretien) */
    const scoreMatch = finalReply.match(/(\d{1,3})\s*\/\s*100/);
    if (scoreMatch) {
      const candidat = detectCandidateName(allMessages);
      const score = Number(scoreMatch[1]);
      const excerpt = allMessages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "Candidat" : "Recrut'IA"}: ${m.content}`)
        .join("\n\n")
        .slice(0, 1500);
      void sendChatbotAlert({ candidat, score, date: new Date().toISOString(), excerpt });
    }

    res.json({
      reply: finalReply,
      recordId: saveResult?.recordId ?? recordId,
      saved: Boolean(saveResult),
    });
  } catch (err) {
    req.log.error({ err }, "Unable to reach Anthropic proxy");
    res.status(500).json({ error: "Impossible de joindre le chatbot recruteur." });
  }
});

export default router;
