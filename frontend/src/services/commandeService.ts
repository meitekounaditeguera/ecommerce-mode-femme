import api from './api'
import type { Commande, Paiement } from '../types/commande'
import type { ArticlePanier } from '../types/panier'

export async function creerCommande(articles: ArticlePanier[]): Promise<Commande> {
  const lignes = articles.map((a) => ({
    produit_variante_id: a.produitVarianteId,
    quantite: a.quantite,
  }))
  const reponse = await api.post<Commande>('/commandes/', { lignes })
  return reponse.data
}

export async function payerCommande(commandeId: number): Promise<Paiement> {
  const reponse = await api.post<Paiement>(`/commandes/${commandeId}/paiement`, {
    methode: 'carte_simulee',
    forcer_echec: false,
  })
  return reponse.data
}

export async function listerMesCommandes(): Promise<Commande[]> {
  const reponse = await api.get<Commande[]>('/commandes/mes-commandes')
  return reponse.data
}