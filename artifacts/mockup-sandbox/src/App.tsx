import { useEffect, useState } from 'react';
import { fetchProjects } from './main'; // Import de la fonction que tu as écrite

function App() {
  const [projets, setProjets] = useState([]);

  useEffect(() => {
    // On appelle Airtable quand le site s'affiche
    fetchProjects().then(data => {
      setProjets(data);
    });
  }, []);

  return (
    <div>
      <h1>Mon Portfolio</h1>
      <ul>
        {projets.map((p) => (
          <li key={p.id}>
            {p.Nom} {/* Remplace 'Nom' par le nom de ta colonne Airtable */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;