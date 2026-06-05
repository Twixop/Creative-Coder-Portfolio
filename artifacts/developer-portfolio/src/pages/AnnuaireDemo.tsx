import { useEffect, useMemo, useRef, useState } from "react";

type Statut = "Actif" | "Inactif" | "En test";

type Tool = {
  id: string; nom: string; categorie: string; departement: string;
  description: string; fonctions: string; contact: string;
  lienDoc: string; statut: Statut;
};

type AdminForm = {
  nom: string; categorie: string; departement: string; description: string;
  fonctions: string; contact: string; lienDoc: string; statut: Statut;
  adminSecret: string;
};

const EMPTY_FORM: AdminForm = {
  nom: "", categorie: "", departement: "", description: "",
  fonctions: "", contact: "", lienDoc: "", statut: "Actif", adminSecret: "",
};

const STATUT_COLORS: Record<Statut, string> = {
  Actif: "var(--cyan)",
  Inactif: "var(--pink)",
  "En test": "var(--violet)",
};

const CAT_COLORS: Record<string, string> = {
  Communication: "#39f5ff", Documentation: "#8a4dff", Design: "#ff2bd6",
  Développement: "#4dffb4", "Base de données": "#ffcc00", Automatisation: "#ff7c4d",
  "Gestion de projet": "#7cbaff", Autre: "#aaaaaa",
};

function catColor(cat: string) {
  return CAT_COLORS[cat] ?? "#8a4dff";
}

function CatIcon({ cat }: { cat: string }) {
  const color = catColor(cat);
  return (
    <span className="tool-cat-icon" style={{ background: `${color}1a`, borderColor: `${color}55`, color }}>
      {cat.charAt(0).toUpperCase()}
    </span>
  );
}

function StatusBadge({ statut }: { statut: Statut }) {
  const cls = statut === "Actif" ? "badge--actif" : statut === "Inactif" ? "badge--inactif" : "badge--entest";
  return <span className={`status-badge ${cls}`}>{statut}</span>;
}

const BASE = import.meta.env.BASE_URL as string;

export default function AnnuaireDemo() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"airtable" | "sample" | "">("");
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState<AdminForm>(EMPTY_FORM);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadTools(quiet = false) {
    if (!quiet) setLoading(true);
    setFetchError("");
    try {
      const r = await fetch(`${BASE}api/annuaire`);
      const d = (await r.json()) as { tools: Tool[]; source: "airtable" | "sample" };
      setTools(d.tools ?? []);
      setSource(d.source ?? "sample");
      setLastRefresh(new Date());
    } catch {
      setFetchError("Impossible de charger les outils.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
    intervalRef.current = setInterval(() => loadTools(true), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const categories = useMemo(() => [...new Set(tools.map((t) => t.categorie).filter(Boolean))].sort(), [tools]);
  const departements = useMemo(() => [...new Set(tools.map((t) => t.departement).filter(Boolean))].sort(), [tools]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tools.filter((t) => {
      const matchSearch = !q || t.nom.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.categorie.toLowerCase().includes(q);
      const matchCat = !catFilter || t.categorie === catFilter;
      const matchDept = !deptFilter || t.departement === deptFilter;
      return matchSearch && matchCat && matchDept;
    });
  }, [tools, search, catFilter, deptFilter]);

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMsg(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminForm.adminSecret.trim()) {
        headers["x-admin-secret"] = adminForm.adminSecret.trim();
      }
      const { adminSecret: _, ...payload } = adminForm;
      const r = await fetch(`${BASE}api/annuaire`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const d = (await r.json()) as { tool?: Tool; error?: string };
      if (!r.ok) throw new Error(d.error || "Erreur serveur.");
      if (d.tool) setTools((prev) => [d.tool!, ...prev]);
      setAdminMsg({ type: "ok", text: `✓ "${adminForm.nom}" ajouté avec succès.` });
      setAdminForm(EMPTY_FORM);
    } catch (err) {
      setAdminMsg({ type: "err", text: err instanceof Error ? err.message : "Erreur inconnue." });
    } finally {
      setAdminLoading(false);
    }
  }

  function Field({ label, name, type = "text", required = false }: { label: string; name: keyof AdminForm; type?: string; required?: boolean }) {
    return (
      <label className="admin-field">
        <span>{label}{required && <em> *</em>}</span>
        {type === "textarea" ? (
          <textarea value={adminForm[name]} onChange={(e) => setAdminForm((f) => ({ ...f, [name]: e.target.value }))} rows={3} />
        ) : type === "select" ? (
          <select value={adminForm[name]} onChange={(e) => setAdminForm((f) => ({ ...f, [name]: e.target.value as Statut }))}>
            <option>Actif</option><option>Inactif</option><option>En test</option>
          </select>
        ) : (
          <input type={type} value={adminForm[name]} onChange={(e) => setAdminForm((f) => ({ ...f, [name]: e.target.value }))} required={required} />
        )}
      </label>
    );
  }

  return (
    <main className="demo-shell annuaire-shell">
      <div className="container">
        {/* Nav */}
        <nav className="demo-nav">
          <a href={BASE || "/"} className="back-link">← Retour au portfolio</a>
          <span className="demo-badge">Démo live // Annuaire Outils Interne</span>
        </nav>

        {/* Title */}
        <div className="annuaire-header">
          <h1 className="annuaire-title">
            <span className="neon-violet">ANNUAIRE</span>{" "}
            <span className="neon-cyan">OUTILS</span>
          </h1>
          <div className="annuaire-header-actions">
            <span className="refresh-info" title={`Dernière mise à jour : ${lastRefresh.toLocaleTimeString("fr-FR")}`}>
              {source === "airtable" ? (
                <span className="source-tag source-airtable">● Airtable live</span>
              ) : source === "sample" ? (
                <span className="source-tag source-sample">● Données exemple</span>
              ) : null}
            </span>
            <button className="btn-ghost" onClick={() => loadTools()} title="Rafraîchir">⟳ Rafraîchir</button>
            <button className={`btn ${showAdmin ? "btn--active" : ""}`} onClick={() => { setShowAdmin(!showAdmin); setAdminMsg(null); }}>
              {showAdmin ? "✕ Fermer admin" : "+ Ajouter un outil"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="annuaire-controls">
          <div className="ann-search-wrap">
            <svg className="ann-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="ann-search-input"
              type="text"
              placeholder="Rechercher un outil…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && <button className="ann-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
        </div>

        {/* Filters */}
        {(categories.length > 0 || departements.length > 0) && (
          <div className="annuaire-filters">
            {categories.length > 0 && (
              <div className="filter-group">
                <span className="filter-group-label">Catégorie</span>
                <button className={`filter-chip ${!catFilter ? "active" : ""}`} onClick={() => setCatFilter("")}>Toutes</button>
                {categories.map((c) => (
                  <button key={c} className={`filter-chip ${catFilter === c ? "active" : ""}`} style={catFilter === c ? { borderColor: catColor(c), color: catColor(c) } : {}} onClick={() => setCatFilter(catFilter === c ? "" : c)}>{c}</button>
                ))}
              </div>
            )}
            {departements.length > 0 && (
              <div className="filter-group">
                <span className="filter-group-label">Département</span>
                <button className={`filter-chip ${!deptFilter ? "active" : ""}`} onClick={() => setDeptFilter("")}>Tous</button>
                {departements.map((d) => (
                  <button key={d} className={`filter-chip ${deptFilter === d ? "active" : ""}`} onClick={() => setDeptFilter(deptFilter === d ? "" : d)}>{d}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin panel */}
        {showAdmin && (
          <div className="admin-panel panel reveal">
            <h2 className="admin-title neon-pink">Ajouter un outil</h2>
            <form className="admin-form" onSubmit={handleAdminSubmit}>
              <div className="admin-form-grid">
                <Field label="Nom de l'outil" name="nom" required />
                <Field label="Catégorie" name="categorie" />
                <Field label="Département" name="departement" />
                <Field label="Statut" name="statut" type="select" />
                <Field label="Contact référent" name="contact" type="email" />
                <Field label="Lien documentation" name="lienDoc" type="url" />
                <Field label="Mot de passe admin (ADMIN_SECRET)" name="adminSecret" type="password" />
              </div>
              <Field label="Description" name="description" type="textarea" />
              <Field label="Fonctions principales" name="fonctions" type="textarea" />
              {adminMsg && (
                <p className={adminMsg.type === "ok" ? "admin-msg--ok" : "admin-msg--err"}>{adminMsg.text}</p>
              )}
              <div className="admin-actions">
                <button className="btn" type="submit" disabled={adminLoading}>
                  {adminLoading ? "Enregistrement…" : "Enregistrer dans Airtable"}
                </button>
                {source === "sample" && (
                  <p className="admin-note">⚠ La table <strong>Annuaire</strong> n'existe pas encore dans Airtable — crée-la avec les champs listés ci-dessus pour activer la persistance.</p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Stats bar */}
        <div className="annuaire-stats">
          {loading ? (
            <span className="ann-loading-msg">Chargement des outils…</span>
          ) : fetchError ? (
            <span className="ann-error-msg">{fetchError}</span>
          ) : (
            <span className="ann-count">{filtered.length} outil{filtered.length !== 1 ? "s" : ""}{(search || catFilter || deptFilter) ? " trouvés" : " au total"}</span>
          )}
        </div>

        {/* Grid */}
        {!loading && (
          <div className="tools-grid">
            {filtered.map((tool, i) => (
              <article
                key={tool.id}
                className="tool-card reveal"
                style={{ animationDelay: `${i * 0.05}s` }}
                data-status={tool.statut}
                onClick={() => setSelectedTool(tool)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedTool(tool)}
                aria-label={`Voir détails de ${tool.nom}`}
              >
                <div className="tool-card-top">
                  <CatIcon cat={tool.categorie} />
                  <div className="tool-card-meta">
                    <h3 className="tool-name">{tool.nom}</h3>
                    <StatusBadge statut={tool.statut} />
                  </div>
                </div>
                <p className="tool-desc">{tool.description}</p>
                <div className="tool-tags">
                  {tool.categorie && <span className="tool-tag" style={{ borderColor: `${catColor(tool.categorie)}55`, color: catColor(tool.categorie) }}>{tool.categorie}</span>}
                  {tool.departement && <span className="tool-tag tool-tag--dept">{tool.departement}</span>}
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="ann-empty">Aucun outil ne correspond à cette recherche.</p>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTool && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTool(null); }} role="dialog" aria-modal="true" aria-label={`Détails de ${selectedTool.nom}`}>
          <div className="tool-modal">
            <button className="modal-close" onClick={() => setSelectedTool(null)} aria-label="Fermer">✕</button>
            <div className="modal-header">
              <CatIcon cat={selectedTool.categorie} />
              <div>
                <h2 className="modal-name neon-cyan">{selectedTool.nom}</h2>
                <StatusBadge statut={selectedTool.statut} />
              </div>
            </div>

            {selectedTool.description && (
              <div className="modal-section">
                <p className="modal-section-title neon-violet">Description</p>
                <p className="modal-body">{selectedTool.description}</p>
              </div>
            )}

            {selectedTool.fonctions && (
              <div className="modal-section">
                <p className="modal-section-title neon-violet">Fonctions principales</p>
                <ul className="modal-fonctions">
                  {selectedTool.fonctions.split(/[,\n•·]/).map((f, i) => f.trim() ? <li key={i}>{f.trim()}</li> : null)}
                </ul>
              </div>
            )}

            <div className="modal-chips">
              {selectedTool.categorie && <span className="tool-tag" style={{ borderColor: `${catColor(selectedTool.categorie)}55`, color: catColor(selectedTool.categorie) }}>{selectedTool.categorie}</span>}
              {selectedTool.departement && <span className="tool-tag tool-tag--dept">{selectedTool.departement}</span>}
            </div>

            <div className="modal-links">
              {selectedTool.contact && (
                <a className="modal-link" href={`mailto:${selectedTool.contact}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {selectedTool.contact}
                </a>
              )}
              {selectedTool.lienDoc && (
                <a className="modal-link modal-link--doc" href={selectedTool.lienDoc} target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Documentation
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
