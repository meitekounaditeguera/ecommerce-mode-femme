import api from './api'
import type { Avis } from '../types/avis'

export async function listerAvisProduit(produitId: number): Promise<Avis[]> {
  const reponse = await api.get<Avis[]>(`/avis/produit/${produitId}`)
  return reponse.data
}

export async function creerAvis(
  produitId: number,
  commandeId: number,
  note: number,
  commentaire: string
): Promise<Avis> {
  const reponse = await api.post<Avis>('/avis/', {
    produit_id: produitId,
    commande_id: commandeId,
    note,
    commentaire,
  })
  return reponse.data
}