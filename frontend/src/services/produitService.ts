import api from './api'
import type { Produit } from '../types/produit'

// Un "service" regroupe les fonctions qui parlent au backend pour une
// ressource donnée (ici : les produits). Les composants/pages n'appellent
// jamais axios directement, ils passent par ces fonctions — ça garde le code
// des pages plus lisible et centralise la logique d'appel API à un seul
// endroit si jamais l'URL ou le format change.

// "async function" + "await" : la requête HTTP prend du temps (réseau), donc
// la fonction est asynchrone. "await" met la fonction en pause jusqu'à ce que
// la réponse arrive, sans bloquer le reste de l'application. Le type de
// retour Promise<Produit[]> veut dire "une promesse qui, une fois résolue,
// donnera un tableau de Produit".
export async function listerProduits(): Promise<Produit[]> {
  const reponse = await api.get<Produit[]>('/produits/')
  return reponse.data
}

// Même principe, mais pour récupérer un seul produit via son id (utilisé
// par la page FicheProduit avec le paramètre d'URL ":id").
export async function obtenirProduit(id: number): Promise<Produit> {
  const reponse = await api.get<Produit>(`/produits/${id}`)
  return reponse.data
}