import { useEffect, useState } from "react";
import Airtable from 'airtable';

const TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN || '';
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID || '';
const TABLE_NAME = 'Projet';

const base = new Airtable({ apiKey: TOKEN }).base(BASE_ID);

export default function App() {
  const [projets, setProjets] = useState<any[]>([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    base(TABLE_NAME).select({ view: 'Grid view' }).all()
      .then(records => {
        setProjets(records as any[]);
      })
      .catch(err => {
        setErreur(err.message);
      });
  }, []);

  return (
    <div style={{ padding: "20px", color: "white", background: "#1a1a1a", minHeight: "100vh" }}>
      <h1>Test Airtable</h1>
      {erreur && <p style={{ color: "red" }}>Erreur : {erreur}</p>}
      {projets.length === 0 && !erreur && <p>Chargement en cours...</p>}
      <ul>
        {projets.map((p: any) => (
          <li key={p.id} style={{ marginBottom: "10px", background: "#333", padding: "10px" }}>
            <pre>{JSON.stringify(p.fields, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
