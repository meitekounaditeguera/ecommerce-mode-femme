import axios from 'axios'

// axios est une bibliothèque pour faire des requêtes HTTP (comme fetch, mais
// avec plus de fonctionnalités pratiques). Ici on crée une "instance"
// pré-configurée avec l'adresse de notre backend FastAPI, pour ne pas avoir
// à la réécrire à chaque appel.
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // adresse locale de l'API pendant le développement
  headers: {
    'Content-Type': 'application/json',
  },
})

export const URL_BASE = 'http://127.0.0.1:8000'

export function urlImage(cheminRelatif: string | null): string {
  if (!cheminRelatif) return ''
  return `${URL_BASE}${cheminRelatif}`
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On exporte cette instance pour que tous les fichiers "service"
// (produitService.ts, authService.ts, ...) l'utilisent au lieu de recréer
// leur propre config axios à chaque fois.
export default api