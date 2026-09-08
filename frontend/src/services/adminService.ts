import api from './api'
import type { Produit } from '../types/produit'

export interface ProduitUpdate {
  nom?: string
  description?: string
  prix?: number
  categorie_id?: number
}

export async function modifierProduit(id: number, donnees: ProduitUpdate): Promise<Produit> {
  const reponse = await api.patch<Produit>(`/produits/${id}`, donnees)
  return reponse.data
}

export async function supprimerProduit(id: number): Promise<void> {
  await api.delete(`/produits/${id}`)
}