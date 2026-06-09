const BASE = import.meta.env.BASE_URL || "/";

let manifestUrl: string | null = null;

export function setupPwa() {
  if (typeof window === "undefined") return;

  // Manifest généré dynamiquement (start_url = page TSA courante, indépendant du base path).
  if (!document.querySelector('link[rel="manifest"][data-tsa]')) {
    const icon = `${BASE}favicon.svg`;
    const manifest = {
      name: "École TSA — Espace pédagogique",
      short_name: "École TSA",
      description: "Gestion de classe spécialisée TSA",
      start_url: window.location.pathname,
      scope: BASE,
      display: "standalone",
      background_color: "#fdfcf7",
      theme_color: "#7cad8c",
      icons: [
        { src: icon, sizes: "any", type: "image/svg+xml", purpose: "any" },
        { src: icon, sizes: "192x192", type: "image/svg+xml" },
        { src: icon, sizes: "512x512", type: "image/svg+xml" },
      ],
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
    manifestUrl = URL.createObjectURL(blob);
    const link = document.createElement("link");
    link.rel = "manifest";
    link.dataset.tsa = "1";
    link.href = manifestUrl;
    document.head.appendChild(link);
  }

  // Couleur de thème + icône Apple.
  if (!document.querySelector('meta[name="theme-color"][data-tsa]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.dataset.tsa = "1";
    meta.content = "#7cad8c";
    document.head.appendChild(meta);
  }

  // Service worker (production uniquement pour éviter d'interférer avec le HMR).
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`${BASE}sw.js`, { scope: BASE }).catch(() => {
        /* offline non disponible, l'app fonctionne quand même */
      });
    });
  }
}

export function teardownPwa() {
  document.querySelectorAll('link[rel="manifest"][data-tsa]').forEach((el) => el.remove());
  document.querySelectorAll('meta[name="theme-color"][data-tsa]').forEach((el) => el.remove());
  if (manifestUrl) {
    URL.revokeObjectURL(manifestUrl);
    manifestUrl = null;
  }
}
