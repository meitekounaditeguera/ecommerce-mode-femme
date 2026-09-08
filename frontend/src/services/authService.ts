import api from './api'
import type { Utilisateur } from '../types/utilisateur'

// Forme de la réponse renvoyée par FastAPI/OAuth2 lors d'une connexion réussie.
interface ReponseToken {
  access_token: string
  token_type: string
}

// Connexion : FastAPI utilise le standard OAuth2, qui attend les identifiants
// au format "application/x-www-form-urlencoded" (comme un vrai <form> HTML
// classique), et non en JSON — d'où l'usage de URLSearchParams ici au lieu
// d'un simple objet JS. Les champs doivent s'appeler "username"/"password",
// même si chez nous "username" contient un email.
export async function connexion(email: string, motDePasse: string): Promise<string> {
  const formulaire = new URLSearchParams()
  formulaire.append('username', email)
  formulaire.append('password', motDePasse)

  const reponse = await api.post<ReponseToken>('/auth/login', formulaire, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  // On ne renvoie que le "token" (jeton d'authentification) : c'est lui qu'on
  // devra fournir ensuite à chaque requête protégée pour prouver qu'on est
  // connecté.
  return reponse.data.access_token
}

// Inscription : ici la route accepte du JSON classique, donc on peut passer
// un objet JS directement.
export async function inscription(email: string, motDePasse: string): Promise<Utilisateur> {
  const reponse = await api.post<Utilisateur>('/auth/register', {
    email,
    mot_de_passe: motDePasse,
  })
  return reponse.data
}

// Récupère les infos de l'utilisateur connecté à partir de son token.
// Le header "Authorization: Bearer <token>" est la convention standard pour
// transmettre un jeton d'authentification à une API.
export async function obtenirUtilisateurCourant(token: string): Promise<Utilisateur> {
  const reponse = await api.get<Utilisateur>('/auth/moi', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return reponse.data
}