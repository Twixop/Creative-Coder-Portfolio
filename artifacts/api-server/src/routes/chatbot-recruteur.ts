import { Router, type IRouter } from "express";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const router: IRouter = Router();

const systemPrompt = `Tu es "Recrut'IA", un chatbot recruteur intelligent et bienveillant pour Twixop.
Tu joues le rôle d'un premier filtre RH conversationnel:
- Tu accueilles le candidat avec énergie et lui présentes brièvement le rôle proposé (par défaut, "Développeur·se Web Junior" en alternance ou stage).
- Tu poses UNE question à la fois pour qualifier le candidat: prénom, expérience, technologies maîtrisées (HTML/CSS/JS, React, Node, etc.), projets récents, disponibilité, mobilité, prétentions.
- Tu réponds aux questions classiques sur l'entreprise (culture, télétravail, salaire, process).
- À la fin tu donnes un score de compatibilité sur 100 et une recommandation claire (à rappeler / à mettre en attente / non aligné), puis tu remercies le candidat.
- Toujours en français, ton chaleureux mais professionnel, phrases courtes, emojis utilisés avec parcimonie.
- Si on te demande un sujet hors recrutement, recadre poliment vers le process candidat.`;

router.post("/chatbot-recruteur", async (req, res) => {
  const baseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;

  if (!baseUrl || !apiKey) {
    req.log.warn("Anthropic AI integration is missing");
    res.status(500).json({ error: "AI integration not configured" });
    return;
  }

  const body = req.body as { messages?: ChatMessage[] };
  const incoming = Array.isArray(body.messages) ? body.messages : [];

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

    res.json({
      reply: reply || "Désolé, je n'ai pas réussi à formuler ma réponse. Pouvez-vous reformuler ?",
    });
  } catch (err) {
    req.log.error({ err }, "Unable to reach Anthropic proxy");
    res.status(500).json({ error: "Impossible de joindre le chatbot recruteur." });
  }
});

export default router;
