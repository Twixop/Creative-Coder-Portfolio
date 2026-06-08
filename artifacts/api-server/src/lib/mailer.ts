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
