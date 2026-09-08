// ============================================================================
// AuthContext : gère l'état "utilisateur connecté" pour toute l'application.
//
// Le "Context API" de React permet de partager une donnée (et des fonctions)
// entre plusieurs composants SANS avoir à la faire passer manuellement en
// props de composant en composant (ce qu'on appelle le "prop drilling").
// Ici, n'importe quelle page peut savoir "qui est connecté" ou appeler
// "seConnecter()"/"seDeconnecter()" simplement avec le hook useAuth() plus
// bas, sans que App.tsx ait besoin de tout redistribuer manuellement.
// ============================================================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { Utilisateur } from '../types/utilisateur'

// Décrit tout ce que le contexte va exposer aux composants qui l'utilisent :
// les données (utilisateur, token, chargement) et les actions possibles.
interface AuthContextType {
  utilisateur: Utilisateur | null
  token: string | null
  chargement: boolean
  seConnecter: (email: string, motDePasse: string) => Promise<void>
  seDeconnecter: () => void
  sInscrire: (email: string, motDePasse: string) => Promise<void>
}

// createContext crée la "boîte" partagée. On la met à `undefined` par défaut
// pour pouvoir détecter (dans useAuth ci-dessous) si quelqu'un l'utilise par
// erreur en dehors d'un <AuthProvider>.
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthProvider est un composant qui enveloppe le reste de l'application
// (voir App.tsx : <AuthProvider><BrowserRouter>...) et fournit la valeur
// réelle du contexte via `<AuthContext.Provider value={...}>`.
// "children" représente tout ce qui est placé À L'INTÉRIEUR de
// <AuthProvider>...</AuthProvider> dans App.tsx.
export function AuthProvider({ children }: { children: ReactNode }) {
  // useState(() => ...) : la fonction passée n'est exécutée qu'une seule fois,
  // au tout premier rendu, pour lire le token déjà stocké dans le navigateur
  // (localStorage persiste même après fermeture du navigateur, contrairement
  // à une simple variable JS qui serait réinitialisée à chaque rechargement).
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  // "chargement" sert à savoir si on est encore en train de vérifier le token
  // au démarrage, pour éviter d'afficher brièvement "non connecté" avant
  // d'avoir la vraie réponse du serveur.
  const [chargement, setChargement] = useState(true)

  // useEffect exécute du code "en réaction" à un changement — ici, à chaque
  // fois que `token` change (voir le tableau [token] à la fin : ce sont les
  // "dépendances" de l'effet). Cela couvre 2 cas : au tout premier rendu
  // (pour vérifier un token déjà stocké), et après un login/logout.
  useEffect(() => {
    if (token) {
      // Si on a un token, on demande au backend les infos de l'utilisateur
      // correspondant, pour vérifier que le token est toujours valide.
      authService
        .obtenirUtilisateurCourant(token)
        .then(setUtilisateur)
        .catch(() => {
          // Token invalide ou expiré : on nettoie tout.
          setToken(null)
          localStorage.removeItem('token')
        })
        .finally(() => setChargement(false))
    } else {
      setChargement(false)
    }
  }, [token])

  // Ces trois fonctions seront exposées aux composants via le contexte.
  // Elles centralisent la logique métier de l'authentification à un seul
  // endroit, au lieu de la dupliquer dans chaque page.
  async function seConnecter(email: string, motDePasse: string) {
    const nouveauToken = await authService.connexion(email, motDePasse)
    localStorage.setItem('token', nouveauToken)
    // Changer `token` ici redéclenche automatiquement le useEffect ci-dessus,
    // qui ira chercher les infos de l'utilisateur.
    setToken(nouveauToken)
  }

  function seDeconnecter() {
    localStorage.removeItem('token')
    setToken(null)
    setUtilisateur(null)
  }

  async function sInscrire(email: string, motDePasse: string) {
    await authService.inscription(email, motDePasse)
    // Après l'inscription, on connecte directement l'utilisateur pour lui
    // éviter de devoir remplir à nouveau le formulaire de connexion.
    await seConnecter(email, motDePasse)
  }

  // Tout composant enfant (children) pourra accéder à ces valeurs via
  // useAuth(). Le `value` est recalculé à chaque rendu, mais c'est comme ça
  // que le Context API fonctionne : quand une valeur change, tous les
  // composants qui utilisent useAuth() sont automatiquement mis à jour.
  return (
    <AuthContext.Provider value={{ utilisateur, token, chargement, seConnecter, seDeconnecter, sInscrire }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé ("custom hook") : c'est le moyen recommandé d'utiliser un
// contexte. Au lieu d'écrire `useContext(AuthContext)` partout (et de devoir
// vérifier `undefined` à chaque fois), on écrit simplement `useAuth()` dans
// n'importe quel composant, par exemple :
//   const { utilisateur, seDeconnecter } = useAuth()
export function useAuth() {
  const contexte = useContext(AuthContext)
  // Si contexte est undefined, ça veut dire que useAuth() a été appelé dans
  // un composant qui n'est PAS à l'intérieur d'un <AuthProvider> : erreur de
  // programmation qu'on préfère détecter tout de suite plutôt que d'avoir un
  // bug silencieux plus tard.
  if (!contexte) throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider')
  return contexte
}