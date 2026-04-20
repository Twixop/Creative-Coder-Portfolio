patJvLORCtz1ThRzw.27a0032f05c4fecc608ffd1153cd9c6380ad64daa09a8fde63b729a974439f80import { useEffect, useState } from "react";
import Airtable from 'airtable';

// --- CONFIGURATION À REMPLIR ---
// Remplace les valeurs entre guillemets par tes vraies infos
const MON_TOKEN = 'patJvLORCtz1ThRzw.27a0032f05c4fecc608ffd1153cd9c6380ad64daa09a8fde63b729a974439f80'; // Commence par pat...
const MON_ID_BASE = 'appe7LRwYtNkRQwuU';   // Commence par app...
const NOM_TABLE = 'Projet';            // Le nom de ton onglet Airtable
// -------------------------------

const base = new Airtable({ apiKey: MON_TOKEN }).base(MON_ID_BASE);

export default function App() {
  const [projets, setProjets] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerDonnees() {
      try {
        console.log("Connexion à Airtable en cours...");
        const records = await base(NOM_TABLE).select({ view: "Grid view" }).all();

        const data = records.map(record => ({
          id: record.id,
          ...record.fields
        }));

        setProjets(data);
      } catch (err: any) {
        console.error("Erreur Airtable:", err);
        setErreur(err.message);
      } finally {
        setChargement(false);
      }
    }
    chargerDonnees();
  }, []);

  if (chargement) {
    return <div style={{ padding: "40px", color: "gray" }}>⏳ Connexion à Airtable...</div>;
  }

  if (erreur) {
    return <div style={{ padding: "40px", color: "red" }}>❌ Erreur : {erreur}</div>;
  }

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Ma Liste Airtable</h1>

      {projets.length === 0 ? (
        <p>Base connectée, mais aucun record trouvé dans "{NOM_TABLE}".</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {projets.map((projet) => (
            <div key={projet.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
              {/* On affiche TOUT ce qu'on trouve pour être sûr */}
              <pre>{JSON.stringify(projet, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}