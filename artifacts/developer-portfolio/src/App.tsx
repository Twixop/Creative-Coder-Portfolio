import { FormEvent, useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  stack: string[];
  demoUrl: string;
  codeUrl: string;
};

const fallbackProjects: Project[] = [
  {
    id: "fallback-1",
    name: "Neon Weather Panel",
    description:
      "Une mini interface météo avec un ton humain et une présentation inspirée d’un tableau de bord futuriste.",
    stack: ["HTML", "CSS", "JavaScript"],
    demoUrl: "https://example.com",
    codeUrl: "https://github.com/example",
  },
  {
    id: "fallback-2",
    name: "Idea Terminal",
    description:
      "Un espace simple pour capturer, organiser et garder les idées de projets avant qu’elles disparaissent.",
    stack: ["HTML", "CSS Grid", "JS"],
    demoUrl: "https://example.com",
    codeUrl: "https://github.com/example",
  },
  {
    id: "fallback-3",
    name: "Portfolio Cyberdeck",
    description:
      "Une première base de portfolio personnel pour montrer le parcours, les essais et les prochaines étapes.",
    stack: ["HTML", "CSS", "Accessibilité"],
    demoUrl: "https://example.com",
    codeUrl: "https://github.com/example",
  },
  {
    id: "fallback-4",
    name: "École TSA",
    description:
      "Application de gestion pédagogique pour une classe d'élèves avec troubles du spectre autistique — planning, fiches élèves, humeurs, carnet de liaison.",
    stack: ["React", "localStorage", "Recharts"],
    demoUrl: "https://example.com",
    codeUrl: "https://github.com/example",
  },
];

function App() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formNote, setFormNote] = useState("");

  const projectsEndpoint = useMemo(() => `${import.meta.env.BASE_URL}api/projects`, []);
  const contactEndpoint = useMemo(() => `${import.meta.env.BASE_URL}api/contact`, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        const response = await fetch(projectsEndpoint);

        if (!response.ok) {
          throw new Error("Impossible de charger les projets Airtable pour le moment.");
        }

        const data = (await response.json()) as { projects?: Project[] };

        if (isMounted && Array.isArray(data.projects) && data.projects.length > 0) {
          const tsaAlreadyPresent = data.projects.some((p: Project) =>
            p.name.toLowerCase().includes("tsa") || p.name.toLowerCase().includes("école tsa")
          );
          setProjects(tsaAlreadyPresent ? data.projects : [...data.projects, fallbackProjects[fallbackProjects.length - 1]]);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Impossible de charger les projets Airtable pour le moment.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, [projectsEndpoint]);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSendingContact(true);
    setFormNote("Transmission du message vers Airtable...");

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Impossible d’envoyer le message pour le moment.");
      }

      form.reset();
      setFormNote("Signal reçu dans Airtable. Merci pour ton message.");
    } catch (error) {
      setFormNote(
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer le message pour le moment.",
      );
    } finally {
      setIsSendingContact(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <a className="logo" href="#top" aria-label="Retour en haut de page">
            <span className="logo-mark">TX</span>
            <span>Twixop</span>
          </a>
          <nav className="nav-links" aria-label="Navigation du portfolio">
            <a href="#about">À propos</a>
            <a href="#skills">Compétences</a>
            <a href="#projects">Projets</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="reveal">
              <span className="eyebrow">Junior dev // creative mode online</span>
              <h1>
                Salut, moi c’est <span className="highlight">Twixop</span>.
              </h1>
              <p>
                Je suis un développeur junior qui apprend en construisant des interfaces sombres,
                expressives et pleines d’énergie numérique. Je ne prétends pas tout savoir: je teste,
                je casse, je corrige, et je progresse.
              </p>
              <p className="mission">
                Mission personnelle: transformer la curiosité en projets web accessibles, avec une vibe
                rose néon, violet profond et futur proche.
              </p>
              <div className="hero-actions">
                <a className="button" href="#projects">Scanner les projets</a>
                <a className="button secondary" href="#contact">Ouvrir le canal</a>
              </div>
            </div>

            <aside className="profile-card reveal" aria-label="Carte rapide de profil">
              <div className="avatar" aria-hidden="true">&lt;/&gt;</div>
              <ul>
                <li>Curieux avant d’être expert</li>
                <li>Interfaces dark, propres et accessibles</li>
                <li>Apprentissage en cours, progrès assumé</li>
              </ul>
            </aside>
          </div>
        </section>

        <section id="about">
          <div className="container">
            <h2 className="section-title reveal">À propos</h2>
            <div className="about-card panel reveal">
              <p>
                Je m’appelle Twixop et je suis au début de mon parcours dans le développement web.
                J’apprends surtout en fabriquant des choses concrètes: petites pages, interfaces,
                composants, bugs étranges et solutions trouvées après quelques essais.
              </p>
              <p>
                Mon objectif n’est pas d’avoir l’air parfait, mais de devenir meilleur à chaque projet.
                J’aime mélanger structure, créativité et accessibilité pour créer des expériences qui ont
                une vraie personnalité, même quand le code reste simple et facile à comprendre.
              </p>
            </div>
          </div>
        </section>

        <section id="skills">
          <div className="container">
            <h2 className="section-title reveal">Compétences</h2>
            <p className="section-intro reveal">
              Une base simple à modifier selon tes vraies compétences.
            </p>
            <div className="skills-grid">
              <div className="skill-badge reveal"><span className="skill-icon">HTML</span>Structure claire</div>
              <div className="skill-badge reveal"><span className="skill-icon">CSS</span>Styles néon responsive</div>
              <div className="skill-badge reveal"><span className="skill-icon">JS</span>Interactions simples</div>
              <div className="skill-badge reveal"><span className="skill-icon">Git</span>Suivi du code</div>
              <div className="skill-badge reveal"><span className="skill-icon">UI</span>Ambiance visuelle</div>
            </div>
          </div>
        </section>

        <section id="projects">
          <div className="container">
            <h2 className="section-title reveal">Projets</h2>
            <p className="section-intro reveal">
              Ces cartes sont chargées depuis Airtable quand la configuration est disponible.
            </p>
            <div className="projects-grid">
              {isLoading && <div className="status-card">Chargement des projets Airtable...</div>}
              {!isLoading && errorMessage && (
                <div className="status-card">
                  {errorMessage} Les projets d’exemple restent affichés en attendant la configuration.
                </div>
              )}
              {projects.map((project) => {
                const isChatbotRecruteur = project.name.toLowerCase().includes("chatbot recruteur");
                const isNeonWeather = project.name.toLowerCase().includes("neon weather") || project.name.toLowerCase().includes("weather panel");
                const isAnnuaire = project.name.toLowerCase().includes("annuaire");
                const isTsa = project.name.toLowerCase().includes("tsa") || project.name.toLowerCase().includes("école tsa");
                const demoUrl = isChatbotRecruteur
                  ? `${import.meta.env.BASE_URL}demos/chatbot-recruteur`
                  : isNeonWeather
                  ? `${import.meta.env.BASE_URL}demos/neon-weather`
                  : isAnnuaire
                  ? `${import.meta.env.BASE_URL}demos/annuaire`
                  : isTsa
                  ? `${import.meta.env.BASE_URL}demos/ecole-tsa`
                  : project.demoUrl;
                const demoIsInternal = isChatbotRecruteur || isNeonWeather || isAnnuaire || isTsa;
                return (
                  <article className="project-card reveal" key={project.id}>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="tech-stack" aria-label="Technologies utilisées">
                      {project.stack.map((tech) => (
                        <span key={`${project.id}-${tech}`}>{tech}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      <a
                        href={demoUrl}
                        target={demoIsInternal ? "_self" : "_blank"}
                        rel={demoIsInternal ? undefined : "noopener noreferrer"}
                      >
                        Démo
                      </a>
                      <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                        Code
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="container">
            <h2 className="section-title reveal">Contact</h2>
            <p className="section-intro reveal">
              Un message, une idée, une collaboration ou un bug étrange à partager? Le canal est ouvert.
            </p>
            <div className="contact-grid">
              <div className="contact-list panel reveal">
                <a href="mailto:twix2110@hotmail.com">Email: twix2110@hotmail.com</a>
                <a href="https://github.com/Twixop" target="_blank" rel="noopener noreferrer">
                  GitHub: github.com/Twixop
                </a>
                <a href="#projects">CTA: explorer mon travail</a>
              </div>

              <form className="panel reveal" onSubmit={handleContactSubmit} aria-busy={isSendingContact}>
                <label>
                  Votre nom
                  <input type="text" name="name" placeholder="Ada Lovelace" required />
                </label>
                <label>
                  Votre email
                  <input type="email" name="email" placeholder="ada@example.com" required />
                </label>
                <label>
                  Message
                  <textarea name="message" placeholder="Bonjour Twixop, ton portfolio cyberpunk..." required />
                </label>
                <button className="button" type="submit" disabled={isSendingContact}>
                  {isSendingContact ? "Transmission..." : "Envoyer le signal"}
                </button>
                <p className="form-note" role="status" aria-live="polite">{formNote}</p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="container">Créé avec React, Airtable et une énergie rose/violet dark.</div>
      </footer>
    </>
  );
}

export default App;
