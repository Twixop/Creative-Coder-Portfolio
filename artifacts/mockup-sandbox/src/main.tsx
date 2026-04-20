import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
import Airtable from 'airtable';

// On initialise la connexion
const base = new Airtable({apiKey: 'TON_TOKEN_PAT'}).base('TON_ID_DE_BASE');

export const fetchProjects = async () => {
  try {
    const records = await base('NOM_DE_TA_TABLE').select({view: 'Grid view'}).all();
    return records.map(record => ({
      id: record.id,
      ...record.fields
    }));
  } catch (err) {
    console.error("Erreur Airtable:", err);
    return [];
  }
};