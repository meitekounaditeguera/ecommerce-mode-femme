// Un "ArticlePanier" est une ligne du panier côté frontend : contrairement
// aux types dans produit.ts, ceci n'est PAS renvoyé tel quel par l'API,
// c'est une structure qu'on construit nous-mêmes (dans PanierContext) à
// partir des données d'un produit + de la quantité choisie par l'utilisateur.
export interface ArticlePanier {
  produitVarianteId: number
  nom: string
  couleur: string
  taille: string
  prixUnitaire: number
  quantite: number
  stockDisponible: number
  imageUrl: string | null
}