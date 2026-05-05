import { useEffect, useState } from "react";
import Airtable from 'airtable';

const MON_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN || '';
const MON_ID_BASE = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
const NOM_TABLE = 'Projet';

const base = new Airtable({ apiKey: MON_TOKEN }).base(MON_ID_BASE);

export default function App() {
  const [projets, setProjets] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function chargerDonnees() {
      try {
        const records = await base(NOM_TABLE).select({ view: "Grid view" }).all();
        const data = records.map(record => ({
          id: record.id,
          ...record.fields
        }));
        setProjets(data);
      } catch (err: any) {
        setErreur(err.message);
      } finally {
        setChargement(false);
      }
    }
    chargerDonnees();
  }, []);

  if (chargement) {
    return <div style={{ padding: "40px", color: "gray" }}>Connexion à Airtable...</div>;
  }

  if (erreur) {
    return <div style={{ padding: "40px", color: "red" }}>Erreur : {erreur}</div>;
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
              <pre>{JSON.stringify(projet, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
