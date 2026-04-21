import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const introMessage: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour et bienvenue chez Twixop ! 🚀 Je suis Recrut'IA, ton premier point de contact pour le poste de Développeur·se Web Junior (alternance ou stage).\n\nPour commencer, peux-tu me dire ton prénom et en une phrase ce qui t'attire dans ce rôle ?",
};

function ChatbotRecruteurDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([introMessage]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/chatbot-recruteur`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, recordId }),
      });

      const data = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string; recordId?: string | null; saved?: boolean }
        | null;

      if (!response.ok || !data?.reply) {
        throw new Error(data?.error || "Le chatbot ne répond pas pour le moment.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply as string }]);
      if (data.recordId) {
        setRecordId(data.recordId);
      }
      setSavedNotice(
        data.saved
          ? "Conversation sauvegardée dans Airtable."
          : "Conversation non sauvegardée — vérifie qu'une table 'Chatbot' existe dans Airtable.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible de contacter le chatbot recruteur.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function resetConversation() {
    setMessages([introMessage]);
    setInput("");
    setErrorMessage("");
    setRecordId(null);
    setSavedNotice("");
  }

  return (
    <main className="demo-shell">
      <div className="container demo-grid">
        <header className="demo-header reveal">
          <a className="demo-back" href={import.meta.env.BASE_URL}>← Retour au portfolio</a>
          <span className="eyebrow">Démo live // Chatbot recruteur</span>
          <h1>
            <span className="highlight">Recrut'IA</span> — Premier filtre RH conversationnel
          </h1>
          <p>
            Pose-lui des questions comme un candidat: il qualifie ton profil, répond à tes questions
            sur le poste de développeur·se web junior, et conclut par un score de compatibilité.
          </p>
        </header>

        <section className="chat-panel panel reveal" aria-label="Conversation avec le chatbot recruteur">
          <div className="chat-history" ref={scrollRef}>
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`chat-bubble chat-${message.role}`}>
                <span className="chat-author">{message.role === "user" ? "Toi" : "Recrut'IA"}</span>
                <p>{message.content}</p>
              </article>
            ))}
            {isSending && (
              <article className="chat-bubble chat-assistant chat-typing">
                <span className="chat-author">Recrut'IA</span>
                <p>
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </p>
              </article>
            )}
          </div>

          {errorMessage && <p className="chat-error">{errorMessage}</p>}
          {!errorMessage && savedNotice && <p className="chat-saved">{savedNotice}</p>}

          <form className="chat-form" onSubmit={handleSubmit} aria-busy={isSending}>
            <label className="sr-only" htmlFor="chat-input">
              Ta réponse
            </label>
            <textarea
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Réponds au recruteur ou pose une question..."
              rows={2}
              required
              disabled={isSending}
            />
            <div className="chat-actions">
              <button type="button" className="button secondary" onClick={resetConversation}>
                Recommencer
              </button>
              <button type="submit" className="button" disabled={isSending}>
                {isSending ? "Transmission..." : "Envoyer"}
              </button>
            </div>
          </form>
        </section>

        <aside className="demo-side panel reveal">
          <h2>Ce que la démo fait</h2>
          <ul>
            <li>Qualifie chaque candidat en posant les bonnes questions une par une.</li>
            <li>Répond aux questions fréquentes sur le poste, l'équipe et le process.</li>
            <li>Termine par un score de compatibilité et une recommandation pour les RH.</li>
          </ul>
          <h2>Où retrouver les conversations</h2>
          <p>
            Chaque échange est enregistré dans la table <strong>Chatbot</strong> de ta base Airtable.
            Crée-y les colonnes <strong>Candidat</strong>, <strong>Conversation</strong>,{" "}
            <strong>Date</strong> et <strong>Score</strong> pour voir tout le détail.
          </p>
          <h2>Astuce</h2>
          <p>
            Présente-toi comme un vrai candidat (prénom, expérience, techno préférée). Plus tu donnes
            de contexte, plus la qualification est précise.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default ChatbotRecruteurDemo;
