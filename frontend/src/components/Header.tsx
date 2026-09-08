import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { utilisateur, seDeconnecter } = useAuth()
  const [menuOuvert, setMenuOuvert] = useState(false)

  function fermerMenu() {
    setMenuOuvert(false)
  }

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl" onClick={fermerMenu}>
          Ma Boutique
        </Link>

        {/* Navigation desktop — cachée en dessous de md */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/">Catalogue</Link>
          <Link to="/panier">Panier</Link>
          {utilisateur ? (
            <>
              <span className="text-neutral-500">Bonjour, {utilisateur.email}</span>
              <Link to="/mon-compte">Mon compte</Link>
              {utilisateur.role === 'admin' && <Link to="/admin/produits">Admin</Link>}
              <button onClick={seDeconnecter} className="text-bordeaux">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion">Connexion</Link>
              <Link to="/inscription">Inscription</Link>
            </>
          )}
        </nav>

        {/* Bouton hamburger — visible uniquement en dessous de md */}
        <button
          onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          className="md:hidden"
          aria-label="Ouvrir le menu"
        >
          {menuOuvert ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Panneau mobile — affiché seulement si menuOuvert est vrai, et seulement en dessous de md */}
      {menuOuvert && (
        <nav className="md:hidden border-t border-neutral-200 px-6 py-4 flex flex-col gap-4 text-sm">
          <Link to="/" onClick={fermerMenu}>Catalogue</Link>
          <Link to="/panier" onClick={fermerMenu}>Panier</Link>
          {utilisateur ? (
            <>
              <span className="text-neutral-500">Bonjour, {utilisateur.email}</span>
              <Link to="/mon-compte" onClick={fermerMenu}>Mon compte</Link>
              {utilisateur.role === 'admin' && (
                <Link to="/admin/produits" onClick={fermerMenu}>Admin</Link>
              )}
              <button
                onClick={() => {
                  seDeconnecter()
                  fermerMenu()
                }}
                className="text-bordeaux text-left"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" onClick={fermerMenu}>Connexion</Link>
              <Link to="/inscription" onClick={fermerMenu}>Inscription</Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

export default Header