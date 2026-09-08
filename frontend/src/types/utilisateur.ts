// Décrit la forme d'un utilisateur tel que renvoyé par l'API (route /auth/moi
// par exemple). Utilisé notamment dans AuthContext pour typer l'utilisateur
// connecté.
export interface Utilisateur {
  id: number
  email: string
  role: string
}