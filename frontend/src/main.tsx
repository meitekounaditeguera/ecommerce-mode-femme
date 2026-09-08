// Point d'entrée de l'application React : c'est le tout premier fichier exécuté
// par Vite dans le navigateur (voir index.html qui charge ce fichier).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// createRoot() « accroche » React à la balise <div id="root"> présente dans
// index.html. Le "!" dit à TypeScript qu'on est sûr que cet élément existe.
// .render() affiche ensuite notre composant <App /> à cet endroit du DOM.
createRoot(document.getElementById('root')!).render(
  // StrictMode ne fait rien en production : c'est un outil de développement
  // qui aide à repérer les erreurs (il exécute certains code deux fois pour
  // détecter les effets de bord mal écrits, par exemple).
  <StrictMode>
    <App />
  </StrictMode>,
)
