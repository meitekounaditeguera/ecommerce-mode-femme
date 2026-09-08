import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Catalogue from './pages/Catalogue'
import FicheProduit from './pages/FicheProduit'
import Panier from './pages/Panier'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import MonCompte from './pages/MonCompte'
import Commande from './pages/Commande'
import AdminProduits from './pages/AdminProduits'
import { AuthProvider } from './context/AuthContext'
import { PanierProvider } from './context/PanierContext'
import PageIntrouvable from './pages/PageIntrouvable'


// App est le composant racine : celui qui organise toute l'application.
// C'est ici qu'on empile les "providers" (contextes partagés à toute l'app)
// et qu'on définit les routes (quelle page afficher selon l'URL).
function App() {
  return (
    // AuthProvider rend l'utilisateur connecté (et les fonctions de connexion/
    // déconnexion) disponibles dans TOUS les composants enfants, sans avoir à
    // les passer manuellement de composant en composant ("prop drilling").
    // Voir src/context/AuthContext.tsx pour le détail.
    <AuthProvider>
      {/* PanierProvider fait la même chose pour le contenu du panier : n'importe
          quelle page peut lire/modifier le panier via le hook usePanier().
          Voir src/context/PanierContext.tsx. */}
      <PanierProvider>
        {/* BrowserRouter active la navigation par URL (ex: /panier, /connexion)
            sans recharger la page à chaque clic — c'est le principe d'une SPA
            (Single Page Application). */}
        <BrowserRouter>
          {/* Header est affiché sur TOUTES les pages car il est en dehors de
              <Routes> : c'est la barre de navigation commune. */}
          <Header />
          {/* Routes/Route associent une URL (path) à un composant de page
              (element). Seule la route qui correspond à l'URL actuelle est
              affichée. ":id" dans "/produits/:id" est un paramètre dynamique,
              récupérable dans FicheProduit via useParams(). */}
          <Routes>
            <Route path="/" element={<Catalogue />} />
            <Route path="/produits/:id" element={<FicheProduit />} />
            <Route path="/panier" element={<Panier />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/mon-compte" element={<MonCompte />} />
            <Route path="/commande" element={<Commande />} />
            <Route path="/admin/produits" element={<AdminProduits />} />
            <Route path="*" element={<PageIntrouvable />} />
          </Routes>
        </BrowserRouter>
      </PanierProvider>
    </AuthProvider>
  )
}

export default App