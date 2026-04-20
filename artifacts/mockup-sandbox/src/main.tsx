import { useEffect, useState } from "react";
import Airtable from 'airtable';

// --- REMPLACE ICI ---
const TOKEN = 'patJvLORCtz1ThRzw.27a0032f05c4fecc608ffd1153cd9c6380ad64daa09a8fde63b729a974439f80'; // Ton token secret
const BASE_ID = 'appe7LRwYtNkRQwuU/tblUsFRcUsizHsIhS'; // Ton ID de base
const TABLE_NAME = 'Projet'; // Le nom exact de l'onglet
// --------------------

const base = new Airtable({apiKey: TOKEN}).base(BASE_ID);

export default function App() {
  const [projets, setProjets] = useState<any[]>([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    console.log("Tentative de connexion à Airtable...");

    base(TABLE_NAME).select({ view: 'Grid view' }).all()
      .then(records => {
        console.log("Données reçues :", records);
        setProjets(records);
      })
      .catch(err => {
        console.error("Erreur détaillée :", err);
        setErreur(err.message);
      });
  }, []);

  return (
    <div style={{ padding: "20px", color: "white", background: "#1a1a1a", minHeight: "100vh" }}>
      <h1>Test Airtable</h1>

      {erreur && <p style={{ color: "red" }}>Erreur : {erreur}</p>}

      {projets.length === 0 && !erreur && <p>Chargement en cours... (Regarde la console si ça dure)</p>}

      <ul>
        {projets.map((p) => (
          <li key={p.id} style={{ marginBottom: "10px", background: "#333", padding: "10px" }}>
            <pre>{JSON.stringify(p.fields, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}