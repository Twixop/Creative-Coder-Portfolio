import { Resend } from "resend";
import { logger } from "./logger";

export async function sendChatbotAlert(params: {
  candidat: string;
  score: number | null;
  date: string;
  excerpt: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;

  if (!apiKey || !to) {
    logger.debug("Email alert skipped — RESEND_API_KEY / ALERT_EMAIL_TO not configured");
    return;
  }

  const resend = new Resend(apiKey);

  const scoreHtml = params.score !== null
    ? `<p><strong>Score :</strong> <span style="color:#8a4dff;font-size:1.4em">${params.score}/100</span></p>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;background:#07020f;color:#e0e0e0;padding:24px;border-radius:8px;border:1px solid #8a4dff">
      <h2 style="color:#ff2bd6;margin-top:0">🤖 Nouveau candidat — Recrut'IA</h2>
      <p><strong>Candidat :</strong> ${params.candidat}</p>
      ${scoreHtml}
      <p><strong>Date :</strong> ${new Date(params.date).toLocaleString("fr-FR")}</p>
      <hr style="border-color:#8a4dff;margin:16px 0"/>
      <p style="color:#aaa;font-size:0.9em"><strong>Extrait :</strong></p>
      <pre style="background:#1a1a2e;padding:12px;border-radius:4px;font-size:0.85em;color:#39f5ff;white-space:pre-wrap">${params.excerpt}</pre>
      <p style="color:#666;font-size:0.8em;margin-bottom:0">Portfolio Twixop • Chatbot Recruteur</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `🤖 Candidat reçu : ${params.candidat}${params.score !== null ? ` — Score ${params.score}/100` : ""}`,
    html,
  });

  if (error) {
    logger.warn({ error }, "Resend email failed");
  } else {
    logger.info({ to, candidat: params.candidat }, "Chatbot alert email sent via Resend");
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHeader(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

function safeFilenamePart(s: string): string {
  return s.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60);
}

export async function sendCarnetLiaison(params: {
  to: string;
  eleve: string;
  semaine: string;
  message?: string;
  pdfBase64: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY non configurée" };
  }

  const resend = new Resend(apiKey);
  const from = process.env.CARNET_EMAIL_FROM || "onboarding@resend.dev";

  const eleve = escapeHtml(params.eleve);
  const semaine = escapeHtml(params.semaine);
  const message = params.message ? escapeHtml(params.message) : "";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;color:#2d2d2d;padding:20px">
      <h2 style="color:#5a9367;margin-top:0">📒 Carnet de liaison — ${eleve}</h2>
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-joint le carnet de liaison de <strong>${eleve}</strong> pour la semaine du <strong>${semaine}</strong>.</p>
      ${message ? `<p style="background:#f0f7f2;border-left:4px solid #5a9367;padding:12px;border-radius:4px;white-space:pre-wrap">${message}</p>` : ""}
      <p>Bien cordialement,<br/>L'équipe pédagogique</p>
      <p style="color:#999;font-size:0.8em;margin-bottom:0">Envoyé depuis l'application École TSA</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: sanitizeHeader(`Carnet de liaison — ${params.eleve} — semaine du ${params.semaine}`),
    html,
    attachments: [
      {
        filename: `carnet-${safeFilenamePart(params.eleve)}-${safeFilenamePart(params.semaine)}.pdf`,
        content: params.pdfBase64,
      },
    ],
  });

  if (error) {
    logger.warn({ error }, "Resend carnet email failed");
    return { ok: false, error: typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : "Envoi échoué" };
  }
  logger.info({ to: params.to, eleve: params.eleve }, "Carnet de liaison email sent via Resend");
  return { ok: true };
}
