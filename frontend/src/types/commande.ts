export interface LigneCommandeOut {
  id: number
  quantite: number
  prix_unitaire: string
  produit_variante: {
    id: number
    couleur: { id: number; nom: string }
    taille: { id: number; nom: string }
    stock: number
    produit: { id: number; nom: string }
    image_url: string | null
  }
}

export interface Commande {
  id: number
  statut: string
  total: string
  lignes: LigneCommandeOut[]
}

export interface Paiement {
  id: number
  statut: string
  methode: string
  reference_simulee: string | null
}